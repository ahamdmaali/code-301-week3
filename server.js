'use strict'

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 3080;
const server = express();
const cors = require('cors');
server.use(cors());
server.use(express.urlencoded({extended:true}));
server.set('view engine','ejs');
server.use(express.static("./public"));

const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);




server.get('/',(req,res)=>{
  let SQL = 'SELECT * FROM books;';
  client.query(SQL).then(result => {
    // console.log(result.rows)
    res.render('./pages/index',{database:result.rows});
  })
})
server.post('/searches',searchHandler);

server.post('/books', bookSelectHandelr);
server.get('/books/:id', bookDetailsHandelr);

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
    })
    
}


function bookDetailsHandelr(req, res) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let safeValue = [req.params.id];
  client.query(SQL,safeValue).then(results => {
    res.render('pages/books/show',{database:results.rows[0]});
  }) .catch(error => {
    res.send(error);
  });
}

function bookSelectHandelr(req, res) {
  let SQL = `INSERT INTO books (title,author,imageLinks,descriptions) VALUES ($1,$2,$3,$4) RETURNING *`;
  let safeValues = [req.body.title, req.body.authors,req.body.imageLinks,req.body.description];
  client.query(SQL, safeValues)
  .then(results => {
    res.redirect(`books/${results.rows[0].id}`);
  }) 
  .catch(error => {
    res.send(error);
  });
}




client.connect()
  .then(() => {
    server.listen(PORT, () => console.log(`Listening on port: ${PORT}`));
  })


