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
server.get('/books/:id',bookDatailsHandler)
function bookDatailsHandler(req,res){
 
  let bookId = req.params.id;
  let SQL = `SELECT * FROM books WHERE id=$1;`;
  let safeValue = [bookId];
  client.query(SQL,safeValue)
  .then(data=>{
    res.render('pages/books/show',{bookDeatails:data.rows[0]});
  })
}
let booksArr=[];
function searchHandler(req,res){
  
let SQL = "SELECT * FROM books;";
client.query(SQL)
.then(results=>{
 console.log(results.rows)
//  res.render('pages/searches/new',{bookDeatails: results.rows[0]});
})
     let bookName= req.body.title
     let bookAuther= req.body.auther
    let url= `https://www.googleapis.com/books/v1/volumes?q=${bookName}+${bookAuther}`
   
    superagent.get(url)
    .then(booksData=>{
      let SQL = `INSERT INTO books (title,auther,publisher,publishedDate,imageLinks,canonicalVolumeLink) VALUES
  ($1,$2,$3,$4,$5,$6);`;
      booksData.body.items.forEach(item => {
      let safeValues= [new Book(item).title,new Book(item).auther,new Book(item).publisher,new Book(item).publishedDate,new Book(item).imageLinks,new Book(item).canonicalVolumeLink];
      
      client.query(SQL,safeValues)
      .then(results=>{
       console.log(results.rows)
       
      })
      res.render('pages/searches/new',{bookDeatails: results.rows[0]});
      })
     
    
    })
    .catch(error=>{
        res.send(error);
    })
}

 let Book = function(bookObj){
    this.title= bookObj.volumeInfo.title;
    this.auther= bookObj.volumeInfo.authors[0];
    this.publisher= bookObj.volumeInfo.publisher;
    this.publishedDate=bookObj.volumeInfo.publishedDate;
    this.imageLinks= bookObj.volumeInfo.imageLinks.smallThumbnail;
    this.canonicalVolumeLink= bookObj.volumeInfo.canonicalVolumeLink;
    booksArr.push(this)
};
server.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`)
})