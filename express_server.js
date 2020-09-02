const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

app.set('view engine', 'ejs');

//can contain html in res.send
app.get("/", (req, res) => {
  res.send("Heck");
});

app.listen(PORT, () => {
  console.log(`The BLACK GATE is open on port: ${PORT}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//abstraction of the urlDatabase into templateVar to give the whole object a callable key in the views ejs file.
app.get("/urls", (req, res) => {
  let templateVar = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVar);
});

app.get("/urls/new", (req, res) => {
  //might n eed to at tempvar with username here
  let templateVar = { username: req.cookies["username"] }
  res.render("urls_new", templateVar);
});

app.get("/register", (req, res) => {
  let templateVar = { username: req.cookies["username"] }
  res.render("urls_reg", templateVar)
})

app.get("/u/:shortURL", (req, res) => {
  req.params;
  res.redirect(urlDatabase[req.params.shortURL]);
});



app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  console.log("Params body\n", req.body);
  res.redirect('/urls');
});

app.post("/logout", (req,res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})

app.post("/register", (req, res) => {
  let temp = genRandomString()
  req.body
  console.log("captured:\n", req.body)
  users[temp] = {
    id: temp,
    email: req.body.email,
    password: req.body.password
  }
  console.log(users)

})

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  req.params;
  //console.log("Showing a tinyURL", req.params)
  res.render("urls_show", templateVars);
});

//if anything goes wrong move this one
app.post("/urls/:shortURL", (req, res) => {
  req.params;
  //console.log("Edit a tinyURL:\n", req.params, req.params.shortURL, req.body)
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

//log the post request to the console.
app.post("/urls", (req, res) => {
  console.log(req.body);
  let temp = genRandomString();
  urlDatabase[temp] = req.body.longURL;
  //res.send("Ok");
  console.log(urlDatabase);
  res.redirect(`/urls/${temp}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  req.params;
  console.log("This: ", req.params);
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
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

//curl -i localhost:8080/hello to see headers and html:

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <strong>World!</strong></body></hmtl>\n");
// });

// app.get("/set", (req, res) => {
//   const a = 1;
//   res.send(`a = ${a}`)
// });

// app.get("/fetch", (req, res) => {
//   res.send(`a = ${a}`)
// });