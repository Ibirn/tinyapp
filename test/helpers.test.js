const { assert } = require('chai');
const { urlsForID, getID, checkInUse, genRandomString } = require("../helpers");
const bcrypt = require('bcrypt');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i45opL: { longURL: "https://www.google.ca", userID: "dke93u" }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkInUse("user@example.com", users);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return undefined with an invalid email', function() {
    const user = checkInUse("user3@example.com", users);
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return a user with a matching email and password', function() {
    const user = getID("user@example.com", "purple-monkey-dinosaur", users);
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return an error when password and email do not match', function() {
    const user = getID("user@example.com", "orange-monkey-dinosaur", users);
    const expectedOutput = undefined;
    // Write your assert statement here
    assert.equal(user, expectedOutput);
  });
  it('should return an object with URLs created by specific user', function() {
    const user = urlsForID("aJ48lW", urlDatabase);
    const expectedOutput = {  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
      i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }};
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });
  it('should return an empty object user has not created any URLS', function() {
    const user = urlsForID("123456", urlDatabase);
    const expectedOutput = {};
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });
});