const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set('view engine', 'ejs')
//can contain html in res.send
app.get("/", (req, res) => {
  res.send("Heck");
});

app.listen(PORT, () => {
  console.log(`The BLACK GATE is open on port: ${PORT}`)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
});

//abstrraction of the urlDatabase into templateVar to give the whole object a callable key in the views ejs file.
app.get("/urls", (req, res) => {
  let templateVar = { urls: urlDatabase }
  res.render('urls_index', templateVar)
})

app.get("/urls/new", (req,res) => {
  res.render("urls_new")
})

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  req.params;
  console.log(req.params)
  res.render("urls_show", templateVars);
});


//curl -i localhost:8080/hello to see headers and html:

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <strong>World!</strong></body></hmtl>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`)
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`)
});

//log the post request to the console.
app.post("/urls", (req, res) => {
console.log(req.body);
res.send("Ok");
});

const genRandomString = () => {
  let output = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i <= 6; i++) {
    output += characters[Math.floor(Math.random() * 62)]
  }
}

console.log(genRandomString())