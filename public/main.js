var SpacebookApp = function () {

  var posts = [];

  var $posts = $(".posts");

  _renderPostsFromDB();

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
      data: {'postText': newPost } ,
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


  function _renderComments(postIndex) {
    var post = $(".post")[postIndex];
    $commentsList = $(post).find('.comments-list')
    $commentsList.empty();
    var source = $('#comment-template').html();
    var template = Handlebars.compile(source);
    for (var i = 0; i < posts[postIndex].comments.length; i++) {
        var newHTML = template(posts[postIndex].comments[i]);
        $commentsList.append(newHTML);
    }
  }

  var removePost = function (index) {
    var id = posts[index]._id;
    $.ajax({
      method: "DELETE",
      url: '/delete',
      data: {'postId': id } ,
      success: function (data) {
        console.log(`Post deleted`);
        posts.splice(index, 1);
        _renderPosts();
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
      }
    })
  };

  var addComment = function (newComment, postIndex) {
    var postId = posts[postIndex]._id;
    var buildUrl = `http://localhost:8000/posts/${postId}/comments`;
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


  var deleteComment = function (postIndex, commentIndex) {
    var postId = posts[postIndex]._id;
    var comId = posts[postIndex].comments[commentIndex]._id;
    var buildUrl = `http://localhost:8000/posts/${postId}/delete/${comId}`;
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


  var editPost = function (updPostText, postIndex) {
    var postId = posts[postIndex]._id;
    var buildUrl = `http://localhost:8000/edit/${postId}`;
    $.ajax({
      method: "PUT",
      url: buildUrl,
      data: {'newText': updPostText},
      success: function(data) {
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
  var index = $(this).closest('.post').index();;
  app.removePost(index);
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

  var postIndex = $(this).closest('.post').index();
  var newComment = { text: $comment.val(), user: $user.val() };

  app.addComment(newComment, postIndex);

  $comment.val("");
  $user.val("");

});

$posts.on('click', '.remove-comment', function () {
  //var $commentsList = $(this).closest('.post').find('.comments-list');
  var postIndex = $(this).closest('.post').index();
  var commentIndex = $(this).closest('.comment').index();

  app.deleteComment(postIndex, commentIndex);
});



$posts.on('click', '.upd-post', function () {

  var $updPost = $(this).closest('.input-group').find('.upd-post-text');
  
  if ($updPost.val() === "") {
    alert("Please enter a new text");
    return;
  }

  var postIndex = $(this).closest('.post').index();
  var updPostText = $updPost.val();

  app.editPost(updPostText, postIndex);
  
  $(this).closest('.edit-form').toggleClass('show');
});
