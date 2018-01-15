var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/spacebookDB', function() {
  console.log("DB connection established!!!");
})

var Post = require('./models/postModel');

// TO CREATE COLLECTION (spacebookDB)
// var dummyPost = new Post({
//   postText: 'Hey there',
//   comments: []
// })
// dummyPost.save();

var app = express();
app.use(express.static('public'));
app.use(express.static('node_modules'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// You will need to create 5 server routes
// These will define your API:

// 1) to handle getting all posts and their comments
app.get('/posts', function (req, res) {
  Post.find(function (err, data) {
      if (err) throw err;
      else res.send(data);
  })
})


// 2) to handle adding a post
app.post('/posts', function (req, res) {
  var newobj = new Post(req.body);
  newobj.save(function(err, data) {
    if (err) throw err;
    res.send(data);
  })
 
});

// 3) to handle deleting a post
// 4) to handle adding a comment to a post
// 5) to handle deleting a comment from a post

app.listen(8000, function() {
  console.log("what do you want from me! get me on 8000 ;-)");
});
