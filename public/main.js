var baseUrl = 'http://localhost:8000/';
var SpacebookApp = function () {

  var posts = [];

  var $posts = $(".posts");

  _renderPostsFromDB();

  function _findPostIndexInDbById(postId) {
    for (let index in posts) {
      if (posts[index]._id === postId) {
        console.log(index);
        return index;
      }
    }
  }

  function _renderPostsFromDB() {
    $.ajax({
      method: "GET",
      url: '/posts',
      success: function (data) {
        posts = data;
        console.log(posts);
        _renderPosts();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    });
  }

  function _renderPosts() {
    $posts.empty();
    var source = $('#post-template').html();
    var template = Handlebars.compile(source);
    for (var i = 0; i < posts.length; i++) {
      var newHTML = template(posts[i]);
      console.log(newHTML);
      $posts.append(newHTML);
      _renderComments(i)
    }
  }

  function addPost(newPost) {
    $.ajax({
      method: "POST",
      url: '/posts',
      data: { 'postText': newPost },
      success: function (data) {
        console.log(`Data loaded`);
        posts.push(data);
        _renderPosts();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    })
  }

  // TODO: split index in DB and in DOM
  function _renderComments(postIndexInDB, postIndex) {
    var post = $(".post")[postIndex];
    $commentsList = $(post).find('.comments-list')
    $commentsList.empty();
    var source = $('#comment-template').html();
    var template = Handlebars.compile(source);
    for (var i = 0; i < posts[postIndexInDB].comments.length; i++) {
      var newHTML = template(posts[postIndexInDB].comments[i]);
      $commentsList.append(newHTML);
    }
  }


  var removePost = function (postId) {
    var postIndex = _findPostIndexInDbById(postId);
    $.ajax({
      method: "DELETE",
      url: '/delete',
      data: { 'postId': postId },
      success: function (data) {
        console.log(`Post deleted`);
        posts.splice(postIndex, 1);
        _renderPosts();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    })
  };


  var addComment = function (newComment, postId) {
    var postIndex = _findPostIndexInDbById(postId);
    var buildUrl = `${baseUrl}posts/${postId}/comments`;
    $.ajax({
      method: "POST",
      url: buildUrl,
      data: newComment,
      success: function (data) {
        posts[postIndex] = data;
        _renderComments(postIndex);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    })
  };


  var deleteComment = function (postId, commentId) {
    var postIndex = _findPostIndexInDbById(postId);
    var comId = posts[postIndex].comments[commentIndex]._id;
    var buildUrl = `${baseUrl}posts/${postId}/delete/${comId}`;
    $.ajax({
      method: "DELETE",
      url: buildUrl,
      success: function (data) {
        console.log(`Comment deleted`);
        posts[postIndex].comments.splice(commentIndex, 1);
        _renderComments(postIndex);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    })
  };


  var editPost = function (updPostText, postId) {
    var postIndex = _findPostIndexInDbById(postId);
    var buildUrl = `${baseUrl}edit/${postId}`;
    $.ajax({
      method: "PUT",
      url: buildUrl,
      data: { 'newText': updPostText },
      success: function (data) {
        posts[postIndex] = data;
        _renderPosts();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    })
  }

  return {
    addPost: addPost,
    removePost: removePost,
    addComment: addComment,
    deleteComment: deleteComment,
    editPost: editPost
  };
};

var app = SpacebookApp();


$('#addpost').on('click', function () {
  var $input = $("#postText");
  if ($input.val() === "") {
    alert("Please enter text!");
  } else {
    app.addPost($input.val());
    $input.val("");
  }
});

var $posts = $(".posts");

$posts.on('click', '.remove-post', function () {
  var postId = $(this).closest('.post').data('id');
  app.removePost(postId);
});

$posts.on('click', '.toggle-comments', function () {
  var $clickedPost = $(this).closest('.post');
  $clickedPost.find('.comments-container').toggleClass('show');
});

$posts.on('click', '.edit-post', function () {
  var $clickedPost = $(this).closest('.post');
  $clickedPost.find('.edit-form').toggleClass('show');
});

$posts.on('click', '.add-comment', function () {

  var $comment = $(this).siblings('.comment');
  var $user = $(this).siblings('.name');

  if ($comment.val() === "" || $user.val() === "") {
    alert("Please enter your name and a comment!");
    return;
  }

  var postId = $(this).closest('.post').data('id');
  var newComment = { text: $comment.val(), user: $user.val() };

  app.addComment(newComment, postId);

  $comment.val("");
  $user.val("");

});

$posts.on('click', '.remove-comment', function () {
  //var $commentsList = $(this).closest('.post').find('.comments-list');
  var postId = $(this).closest('.post').data('id');
  var commentIndex = $(this).closest('.comment').index();

  app.deleteComment(postId, commentIndex);
});



$posts.on('click', '.upd-post', function () {

  var $updPost = $(this).closest('.input-group').find('.upd-post-text');

  if ($updPost.val() === "") {
    alert("Please enter a new text");
    return;
  }

  var postId = $(this).closest('.post').data('id');
  var updPostText = $updPost.val();

  app.editPost(updPostText, postId);

  $(this).closest('.edit-form').toggleClass('show');
});


$(function () {
  $("#sortable").sortable();
  $("#sortable").disableSelection();
});