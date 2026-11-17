const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

// Get the book list available in the shop using async/await with Axios
const getAllBooks = async () => {
  const response = await axios.get(`${BASE_URL}/`);
  return response.data;
};

// Get book details based on ISBN using a Promise callback with Axios
const getBookByISBN = (isbn) => {
  return axios
    .get(`${BASE_URL}/isbn/${isbn}`)
    .then((response) => response.data);
};

// Get all books by author using async/await with Axios
const getBooksByAuthor = async (author) => {
  const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
  return response.data;
};

// Get all books by title using a Promise callback with Axios
const getBooksByTitle = (title) => {
  return axios
    .get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
    .then((response) => response.data);
};

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn]);
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = decodeURIComponent(req.params.author);
  const matching = Object.keys(books)
    .filter((isbn) => books[isbn].author === author)
    .reduce((acc, isbn) => {
      acc[isbn] = books[isbn];
      return acc;
    }, {});
  if (Object.keys(matching).length === 0) {
    return res.status(404).json({ message: "No books found for author" });
  }
  return res.status(200).json(matching);
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = decodeURIComponent(req.params.title);
  const matching = Object.keys(books)
    .filter((isbn) => books[isbn].title === title)
    .reduce((acc, isbn) => {
      acc[isbn] = books[isbn];
      return acc;
    }, {});
  if (Object.keys(matching).length === 0) {
    return res.status(404).json({ message: "No books found for title" });
  }
  return res.status(200).json(matching);
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
