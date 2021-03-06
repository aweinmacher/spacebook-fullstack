var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect(process.env.CONNECTION_STRING||'mongodb://localhost/spacebookDB',{useMongoClient: true}, function() {
  console.log("DB connection established!!!");
})

var Post = require('./models/postModel');

// TO CREATE COLLECTION (spacebookDB)
// var dummyPost = new Post({
//   postText: 'Hey there',
//   comments: [ ]
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
app.delete('/delete', function(req, res){
  var postId = req.body.postId;
  Post.findByIdAndRemove(postId, function(err, data){
    if (err) throw err;
    res.send('post deleted');
  })
})

// 4) to handle adding a comment to a post
app.post('/posts/:postId/comments', function (req, res) {
  var postId = req.params.postId;
  Post.findById(postId, function(err, data){
      if (err) throw err;
      data.comments.push(req.body);
      data.save(function(err, data){
        if (err) throw err;
        res.send(data);
      });
    });
});

// 5) to handle deleting a comment from a post
app.delete('/posts/:postId/delete/:comId', function(req, res){
  var postId = req.params.postId;
  var comId = req.params.comId;
  Post.findById(postId, function(err, data){
    if (err) throw err;
    data.comments.id(comId).remove();
    data.save(function(err, data){
      if (err) throw err;
      res.send('comment deleted');
    });
  })
})

// 6) to handle editing posts via PUT request
app.put('/edit/:postId', function(req, res){
  var postId = req.params.postId;
  var newText = req.body.newText;

  Post.findByIdAndUpdate(postId, { $set: { 'postText' : newText}}, { new: true }, function (err, data) {
    if (err) throw err;
    res.send(data);
  });
})

app.listen(process.env.PORT || '8080', function() {
  console.log("what do you want from me! get me on 8000 ;-)");
});
