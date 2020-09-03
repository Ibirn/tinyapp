const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
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

app.get("/", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.listen(PORT, () => {
  console.log(`The BLACK GATE is open on port: ${PORT}`);
});

app.get("/urls", (req, res) => {
  if (users[req.session.user_id]) {
    let templateVar = { urls: urlsForID(req.session.user_id), user: users[req.session.user_id], viewCount };
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
  if (checkInUse(req.body.email)) {
    let check = getID(req.body.email, req.body.password);
    if (check) {
      req.session.user_id = getID(req.body.email, req.body.password);
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
  let temp = genRandomString();
  req.session.user_id = temp;
  req.body;
  if (req.body.email === '' || req.body.password === '') {
    req.session.errorLog = 400;
    res.redirect("/error");
  } else if (checkInUse(req.body.email)) {
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

app.get("/urls/:shortURL", (req, res) => {
  req.params;
  if (!urlDatabase[req.params.shortURL]) {
    req.session.errorLog = 404;
    res.redirect("/error");
  } else if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    let templateVar = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: users[req.session.user_id] };
    req.params;
    res.render("urls_show", templateVar);
  } else {
    req.session.errorLog = 403;
    res.redirect("/error");
  }
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

app.post("/urls", (req, res) => {
  let temp = genRandomString();
  if (!(req.body.longURL.slice(0,7) === 'http://')) {
    const format = 'http://';
    req.body.longURL = format.concat(req.body.longURL);
  }
  urlDatabase[temp] = {
    longURL: req.body.longURL,
    userID: req.session.user_id
  };
  viewCount[temp] = 0;
  res.redirect(`/urls/${temp}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  req.params;
  if (req.session.user_id === urlDatabase[req.params.shortURL]["userID"]) {
    //console.log("Delete This: ", req.params);
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else if (req.session.user_id !== urlDatabase[req.params.shortURL]["userID"]) {
    req.session.errorLog = 401;
    res.redirect("/error");
  }
});

// FUNCTIONS-----------------------------------------------------

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

      if (bcrypt.compareSync(password, users[key]["password"])) {
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