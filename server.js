'use strict'

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const server = express();
const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);
server.use(express.urlencoded({extended:true}));
server.set('view engine','ejs');
server.use(express.static("./public"));

server.get('/',(req,res)=>{
  res.render('pages/index')
})
server.post('/searches',searchHandler);
server.post('/books', bookSelectHandelr);
server.get('/books/:id', bookDetailsHandelr);
server.put('/updateBook/:id',updateBookHandler);
server.delete('/deleteBook/:id',deleteBookHandler);

function Book(bookObj) {
  this.title= bookObj.volumeInfo.title;
  this.auther= bookObj.volumeInfo.authors;
  this.description = bookObj.volumeInfo.description;
  this.publisher= bookObj.volumeInfo.publisher;
  this.publishedDate=bookObj.volumeInfo.publishedDate;
  this.imageLinks= bookObj.volumeInfo.imageLinks.smallThumbnail;
  this.canonicalVolumeLink= bookObj.volumeInfo.canonicalVolumeLink;
  
};

function searchHandler(req,res){
  
  let search = req.body.search;
  let term = req.body.type;
  let url = `https://www.googleapis.com/books/v1/volumes?q=${term}:${search}`;
  superagent.get(url)
  .then(booksdata => {

    let bookdata = booksdata.body.items;
    let bookInfo = bookdata.map((item) => {
      return new Book(item);
    });
      res.render('pages/searches/new',{bookDeatails:bookInfo});
    })
     .catch(error=>{
        res.send(error);
    });
};

function bookSelectHandelr(req, res) {
  let SQL = `INSERT INTO books (title,author,imageLinks,descriptions) VALUES ($1,$2,$3,$4) RETURNING *;`;
  let safeValues = [req.body.title, req.body.authors,req.body.imageLinks,req.body.description];
  
  client.query(SQL, safeValues)
  .then(results => {
    res.redirect(`books/${results.rows[0].id}`);
  }) 
  .catch(error => {
    res.send(error);
  });
};

function bookDetailsHandelr(req, res) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let safeValue = [req.params.id];
  client.query(SQL,safeValue).then(results => {
    res.render('pages/books/show',{database:results.rows[0]});
  }) .catch(error => {
    res.send(error);
  });
};
function updateBookHandler(req,res) {
  let SQL = `UPDATE books SET imageLinks=$1,title=$2,author=$3,description=$4 WHERE id=$5;`;
  let safeValues = [req.body.imageLinks, req.body.title, req.body.author, req.body.description,req.params.id];
  client.query(SQL, safeValues)
  .then(() => {
    res.redirect(`/books/${req.params.id}`);
  })
}
function deleteBookHandler(req, res) {
  let SQL = `DELETE FROM books WHERE id=$1;`;
  let safeValue = [req.params.id];
  client.query(SQL, safeValue).then(() => {
    res.redirect(`/`)
  });
}
client.connect()
  .then(() => {
    server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  })