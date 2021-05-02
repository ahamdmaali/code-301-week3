'use strict'

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const server = express();
server.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`)
})
server.set('view engine','ejs');

server.get('/',(req,res)=>{
    res.render('./pages/index')
})
server.post('/searches',searchHandler);

function searchHandler(req,res){
  
    let url= `https://www.googleapis.com/books/v1/volumes?q=search+terms`
    superagent.get(url)
    .then(booksData=>{

        booksData.body.items.forEach(item=>{
         let book= new Book(item);
         res.render('new',book)
        })  
    })
    .catch(error=>{
        res.send(error);
    })
}

let Book = function(bookObj){
    this.title= bookObj.volumeInfo.title;
    this.publishedDate=bookObj.volumeInfo.publishedDate;
    this.previewLink= bookObj.volumeInfo.previewLink;
    this.canonicalVolumeLink= bookObj.volumeInfo.canonicalVolumeLink;
}