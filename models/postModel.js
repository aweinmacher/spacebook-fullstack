import { Stream } from 'stream';

var mongoose = require('mongoose');

//design the two schema below and use sub docs to define the relationship between posts and comments

var commentSchema = new mongoose.Schema({
    text: String,
    user: String
});

var postSchema = new mongoose.Schema({
    post: String,
    comments: [commentSchema]
});

var Post = mongoose.model('post', postSchema)

module.exports = Post
