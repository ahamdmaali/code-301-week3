'use strict'

require('dotenv').config();
const express = require('express');
const superagent = require('superagent');
const PORT = process.env.PORT || 3000;
const server = express();


server.use(express.urlencoded({extended:true}));
server.set('view engine','ejs');

server.get('/',(req,res)=>{
    res.render('./pages/index')
})
server.post('/searches',searchHandler);
let booksArr=[];
function searchHandler(req,res){
    
     let bookName= req.body.title
     let bookAuther= req.body.auther
    let url= `https://www.googleapis.com/books/v1/volumes?q=${bookName}+${bookAuther}`
   
    superagent.get(url)
    .then(booksData=>{
    
      booksData.body.items.forEach(item => {
       
        new Book(item);
        console.log(booksArr)
        res.render('pages/searches/new',{bookDeatails: booksArr});
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