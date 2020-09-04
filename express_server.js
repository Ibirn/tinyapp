const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const { urlsForID, getID, checkInUse, genRandomString } = require("./helpers")
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['I am the very model of a scientist salarian',"I've studies species Turian, Asari, and Batarian","I'm quite good at genetics(as a subset of biology", "because I am a expert (which I know is a tautology)" ]
}));

//DATABASES------------------------------------------------------------------------

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

const viewCount = {};

const errorLog = {
  400: {id: "Error 400", msg:"Bad request."},
  401: {id: "Error 401", msg:"You do not have permission to edit this link."},
  403: {id: "Error 403", msg:"You do not have authorization."},
  404: {id: "Error 404", msg:"Not here, chief."},

  3: {id: "E-mail already registered", msg:"We're already friends, bud."},
  2: {id: "Bad password/email combination.", msg:"Please double-check your spelling."},
  1: {id: '', msg:"We know you want to get places, but please log in or register first."}
};


//PRODUCTION CODE-------------------------------------------------------------

app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`The MIRROR DIMENSION has opened on port: ${PORT}`);
});

app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVar = { urls: urlsForID(req.session.user_id, urlDatabase), user: users[req.session.user_id], viewCount };
    res.render('urls_index', templateVar);
  } else {
    req.session.errorLog = 1;
    res.redirect("/error");
  }
});

app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]) {
    return res.redirect("/login");
  }
  let templateVar = { user: users[req.session.user_id] };
  res.render("urls_new", templateVar);
});

app.get("/error", (req, res) => {
  let templateVar = { user: users[req.session.user_id], error:errorLog[req.session.errorLog]};
  res.render("urls_error", templateVar);
});

app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  } else {
    let templateVar = { user: users[req.session.user_id] };
    res.render("urls_reg", templateVar);
  }
});

app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    return res.redirect("/urls");
  } else {
    let templateVar = { user: users[req.session.user_id] };
    res.render("urls_login", templateVar);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  req.params;
  if (!urlDatabase[req.params.shortURL]) {
    req.session.errorLog = 404;
    res.redirect("/error");
  } else if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    let templateVar = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: users[req.session.user_id], date: urlDatabase[req.params.shortURL]["date"]};
    req.params;
    res.render("urls_show", templateVar);
  } else {
    req.session.errorLog = 403;
    res.redirect("/error");
  }
});

app.get("/u/:shortURL", (req, res) => {
  req.params;
  if (!urlDatabase[req.params.shortURL]) {
    req.session.errorLog = 404;
    res.redirect("/error");
  }
  viewCount[req.params.shortURL] += 1;
  res.redirect(urlDatabase[req.params.shortURL]["longURL"]);
});

app.post("/login", (req, res) => {
  if (checkInUse(req.body.email, users)) {
    let check = getID(req.body.email, req.body.password, users);
    if (check) {
      req.session.user_id = getID(req.body.email, req.body.password, users);
      return res.redirect("urls");
    }
    req.session.errorLog = 2;
    res.redirect("/error");
  } else {
    req.session.errorLog = 2;
    res.redirect("/error");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  let temp = genRandomString(urlDatabase);
  req.session.user_id = temp;
  req.body;
  if (req.body.email === '' || req.body.password === '') {
    req.session.errorLog = 400;
    res.redirect("/error");
  } else if (checkInUse(req.body.email, users)) {
    req.session.errorLog = 3;
    res.redirect("/error");
  } else {
    users[temp] = {
      id: temp,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  let temp = genRandomString(urlDatabase);
  let date= new Date()
  if (!(req.body.longURL.slice(0,7) === 'http://')) {
    const format = 'http://';
    req.body.longURL = format.concat(req.body.longURL);
  }
  urlDatabase[temp] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    date: date
  };
  viewCount[temp] = 0;
  res.redirect(`/urls/${temp}`);
});

app.post("/urls/:shortURL", (req, res) => {
  req.params;
  if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    viewCount[req.params.shortURL] = 0;
    urlDatabase[req.params.shortURL]["longURL"] = req.body.longURL;
    res.redirect("/urls");
  } else {
    req.session.errorLog = 401;
    res.redirect("/error");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  req.params;
  if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else if (req.session.user_id !== urlDatabase[req.params.shortURL]["userID"]) {
    res.send(401)
    req.session.errorLog = 401;
    res.redirect("/error");
  }
});