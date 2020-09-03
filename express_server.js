const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//TRIAL DATABASES-------------------------------------------------------------------------------------------

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const viewCount = {}

const errorLog = {
  400: {id: "Error 400", msg:"Something's not right."},
  401: {id: "Error 401", msg:"You do not have permission to edit this link."},
  403: {id: "Error 403", msg:"You do not have authorization."},
  404: {id: "Error 404", msg:"Not here, chief."},

  003: {id: "E-mail already registered", msg:"We're already friends, bud."},
  002: {id: "Bad password/email combination.", msg:"Please double-check your spelling."},
  001: {id: '', msg:"We know you want to get places, but please log in or register first."}
}


//PRODUCTION CODE--------------------------------------------------------------------------------------------
app.set('view engine', 'ejs');

//can contain html in res.send
app.get("/", (req, res) => {
  if(users[req.cookies["user_id"]]){
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
  
});

app.listen(PORT, () => {
  console.log(`The BLACK GATE is open on port: ${PORT}`);
});

//abstraction of the urlDatabase into templateVar to give the whole object a callable key in the views ejs file. adding viewcount
app.get("/urls", (req, res) => {
  // console.log("urls cookie id: ", req.cookies["user_id"]);
  // console.log("database:", urlDatabase);
  // console.log("views:", viewCount);
  if (users[req.cookies["user_id"]]) {
    let templateVar = { urls: urlsForID(req.cookies["user_id"]), user: users[req.cookies["user_id"]], viewCount };
    res.render('urls_index', templateVar);
  } else {
    res.cookie('errorLog', 001)
    res.redirect("/error")
  }

});

app.get("/urls/new", (req, res) => {
  if (!users[req.cookies["user_id"]]) {
    return res.redirect("/login");
  }
  let templateVar = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVar);
});

app.get("/error", (req, res) => {
  let templateVar = { user: users[req.cookies["user_id"]], error:errorLog[req.cookies.errorLog]}
  res.render("urls_error", templateVar);
})

app.get("/register", (req, res) => {
  let templateVar = { user: users[req.cookies["user_id"]] };
  res.render("urls_reg", templateVar);
});

app.get("/login", (req, res) => {
  let templateVar = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVar);
});

app.get("/u/:shortURL", (req, res) => {
  req.params;
  if (!urlDatabase[req.params.shortURL]){
    res.statusCode = 404
    res.cookie('errorLog', 404)
    res.redirect("/error")
  }
  viewCount[req.params.shortURL] += 1
  res.redirect(urlDatabase[req.params.shortURL]["longURL"]);
});

app.post("/login", (req, res) => {
  //console.log("Params body \n", req.body);
  if (checkInUse(req.body.email)) {
    let check = getID(req.body.email, req.body.password);
    if (check) {
      res.cookie('user_id', getID(req.body.email, req.body.password));
      return res.redirect("urls");
    }
    console.log('here1')
    res.cookie('errorLog', 002)
    res.redirect("/error")
  } else {
    console.log('here2')
    res.cookie('errorLog', 002)
    res.redirect("/error")
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let temp = genRandomString();
  res.cookie('user_id', temp);
  req.body;
  if (req.body.email === '' || req.body.password === '') {
    res.statusCode = 400
    res.cookie('errorLog', 400)
    res.redirect("/error")
  } else if (checkInUse(req.body.email)) {
    res.cookie('errorLog', 003)
    res.redirect("/error")
  } else {
    users[temp] = {
      id: temp,
      email: req.body.email,
      password: req.body.password
    };
    res.redirect("/urls");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  req.params;
  if (!urlDatabase[req.params.shortURL]) {
    res.statusCode = 404
    res.cookie('errorLog', 404)
    res.redirect("/error")
  } else if (req.cookies["user_id"] === urlDatabase[req.params.shortURL]["userID"]) {
    let templateVar = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: users[req.cookies["user_id"]] };
    req.params;
    res.render("urls_show", templateVar);
  } else {
    res.statusCode = 403
    res.cookie('errorLog', 403)
    res.redirect("/error")
  }
});

//if anything goes wrong move this one FOR EDITING TINYURL
app.post("/urls/:shortURL", (req, res) => {
  req.params;
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL]["userID"]) {
    viewCount[req.params.shortURL] = 0; //viewcount
    urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.statusCode = 401
    res.cookie('errorLog', 401)
    res.redirect("/error")
  }
});

//log the post request to the console.
app.post("/urls", (req, res) => {
  let temp = genRandomString();
  if(!(req.body.longURL.slice(0,7) === 'http://')){
    const format = 'http://'
    req.body.longURL = format.concat(req.body.longURL);
  }
  urlDatabase[temp] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  };
  viewCount[temp] = 0;
  console.log(urlDatabase, users)
  res.redirect(`/urls/${temp}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  req.params;
  console.log(req.cookies["user_id"], urlDatabase[req.params.shortURL], req.params)
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL]["userID"]) {
    //console.log("Delete This: ", req.params);
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else if (req.cookies["user_id"] !== urlDatabase[req.params.shortURL]["userID"]){
    res.statusCode = 401
    res.cookie('errorLog', res.statusCode)
    res.redirect("/error")
  }
});

// FUNCTIONS--------------------------------------------------------------------------------------------------------

const genRandomString = () => {
  let output = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    output += characters[Math.floor(Math.random() * 62)];
  }
  if (urlDatabase[output]) {
    output = '';
    genRandomString();
  }
  return output;
};

const checkInUse = email => {
  for (const key in users) {
    if (email === users[key]["email"]) {
      return true;
    }
  }
  return false;
};

const getID = (email, password) => {
  for (const key in users) {
    if (email === users[key]["email"]) {
      if (password === users[key]["password"]) {
        return users[key]["id"];
      }
    }
  }
  return false;
};

const urlsForID = id => {
  const ownedURLS = {};
  for (const key in urlDatabase) {
    if (id === urlDatabase[key]["userID"]) {
      ownedURLS[key] = urlDatabase[key];
    }
  }
  return ownedURLS;
};

//curl -i localhost:8080/hello to see headers and html:

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <strong>World!</strong></body></hmtl>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`)
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`)
// });