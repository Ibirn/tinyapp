const express = require('express');
const app = express();
const PORT = 8080;

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//can contain html in res.send
app.get("/", (req, res) => {
  res.send("Heck");
})

app.listen(PORT, () => {
  console.log(`Example app listnening on port: ${PORT}`)
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase)
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <strong>World!</strong></body></hmtl>\n");
})