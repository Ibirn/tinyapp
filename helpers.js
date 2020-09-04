const bcrypt = require('bcrypt');

const genRandomString = (database) => {
  let output = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    let temp = characters[Math.floor(Math.random() * 62)];
    if (database[temp]) {
      i--
    } else {
    output += temp}
  }
  return output;
};

const checkInUse = (email, database) => {
  for (const key in database) {
    if (email === database[key]["email"]) {
      return database[key]["id"];
    }
  }
  return undefined;
};

const getID = (email, password, database) => {
  for (const key in database) {
    if (email === database[key]["email"]) {
      if (bcrypt.compareSync(password, database[key]["password"])) {
        return database[key]["id"];
      }
    }
  }
  return undefined;
};

const urlsForID = (id, database) => {
  const ownedURLS = {};
  for (const key in database) {
    if (id === database[key]["userID"]) {
      ownedURLS[key] = database[key];
    }
  }
  return ownedURLS;
};

module.exports = {
  urlsForID,
  getID,
  genRandomString,
  checkInUse
}