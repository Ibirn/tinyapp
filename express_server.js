const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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

app.set('view engine', 'ejs');

//can contain html in res.send
app.get("/", (req, res) => {
  res.send("Heck");
});

app.listen(PORT, () => {
  console.log(`The BLACK GATE is open on port: ${PORT}`);
});


//abstraction of the urlDatabase into templateVar to give the whole object a callable key in the views ejs file.
app.get("/urls", (req, res) => {
  console.log("urls cookie id: ", req.cookies["user_id"])
  console.log("database:", urlDatabase)
  let templateVar = { urls: urlsForID(req.cookies["user_id"]), user: users[req.cookies["user_id"]] };
  res.render('urls_index', templateVar);
});

app.get("/urls/new", (req, res) => {
  //might need to at tempvar with username here
  if(!users[req.cookies["user_id"]]){
    return res.redirect("/login")
  }
  let templateVar = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVar);
});

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
  //console.log("u/:", req.params.shortURL)
  res.redirect(urlDatabase[req.params.shortURL]["longURL"]);
});

app.post("/login", (req, res) => {
  //console.log("Params body \n", req.body);
  res.clearCookie('user_id');
  if (checkInUse(req.body.email)) {
    let check = getID(req.body.email, req.body.password);
    if (check) {
      res.cookie('user_id', getID(req.body.email, req.body.password));
      return res.redirect("urls");
    }
    res.statusCode = 403;
    return res.send('error ' + res.statusCode);
  } else {
    res.statusCode = 403;
    return res.send('error ' + res.statusCode);
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
  //console.log("em:", req.body.email, "ps:", req.body.password);
  if (req.body.email === '' || req.body.password === '') {
    res.statusCode = 400;
    return res.send('error ' + res.statusCode);
  } else if (checkInUse(req.body.email)) {
    res.statusCode = 400;
    return res.send('error ' + res.statusCode);
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
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: users[req.cookies["user_id"]] };
  req.params;
  //console.log("Showing a tinyURL", req.params)
  res.render("urls_show", templateVars);
});

//if anything goes wrong move this one
app.post("/urls/:shortURL", (req, res) => {
  req.params;
  //console.log("Edit a tinyURL:\n", req.params, req.params.shortURL, req.body)
  console.log("post check:", req.body, "params:", req.params)
  urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
  res.redirect("/urls");
});

//log the post request to the console.
app.post("/urls", (req, res) => {
  let temp = genRandomString();
  urlDatabase[temp] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"]
  }
  res.redirect(`/urls/${temp}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  req.params;
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL]["userID"]){
      console.log("This: ", req.params);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
  } else {
    res.statusCode = 401;
    return res.send('Error ' + res.statusCode);
  }
  

});







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
      ownedURLS[key] = urlDatabase[key]
    }
  }
  return ownedURLS;
}
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