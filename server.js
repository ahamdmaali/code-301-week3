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

server.get('/',(req,res)=>{
    res.render('./pages/index')
})
server.post('/searches',searchHandler);


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

function Book(bookObj) {
  this.title= bookObj.volumeInfo.title;
  this.auther= bookObj.volumeInfo.authors;
  this.description = bookObj.volumeInfo.description;
  this.publisher= bookObj.volumeInfo.publisher;
  this.publishedDate=bookObj.volumeInfo.publishedDate;
  this.imageLinks= bookObj.volumeInfo.imageLinks.smallThumbnail;
  this.canonicalVolumeLink= bookObj.volumeInfo.canonicalVolumeLink;
  
};
server.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`)
})