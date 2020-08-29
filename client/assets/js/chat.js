class WP_Chatkit {

  constructor(nsp) {
    this.domain = window.location.protocol+"//"+window.location.hostname+":"+window.location.port;
    this.nsp = nsp;
    this.socket = io("https://wp-chatkit.herokuapp.com"+nsp, {transports: ['websocket'], upgrade: false});
    this.socket.on('connect_error', function(error) {
      console.log(error);
    });
  }

  connect(username) {
    this.socket.on('connect', function() {
    });
    this.socket.emit('login', {nsp: this.nsp, username: username});
  }

  disconnect(callback) {
    this.socket.on('exit', function (data) {
      callback(data);
    });
  }

  auth(username, callback) {
    callback(username);
    return username;
  }

  changeRoom(object, callback) {
    this.socket.emit('changeRoom', object);
    this.socket.on('change', function (data) {
      callback(data);
    });
  }

  joinRoom(object, callback) {
    this.socket.emit('joinRoom', object);
    this.socket.on('join', function (data) {
      callback(data);
    });
  }

  onlineUsers(callback) {
    this.socket.on('onlineUsers', function(onlineUsers) {
      callback(onlineUsers);
    });
  }

  messages(callback) {
    this.socket.on('updateMessages', function(message) {
      message  = $.parseJSON(message);
      callback(message);
    });
  }

  sendMessage(object) {
    this.socket.emit('sendMessage', object);
  }

}

var storage = {currentRoom: "public"}

$("#inRoom").text(storage.currentRoom);

var chatroom = new WP_Chatkit('/XLNZqA4oAx');

var username = chatroom.auth(prompt("What's your name?"), function(username) {
  chatroom.connect(username);
});

chatroom.joinRoom({user: username, room: storage.currentRoom}, function(data) {
  var message_html = $('.comment-blank').clone();
  $(message_html).find(".author").hide();
  $(message_html).find(".text").text(data);
  $(message_html).removeClass("comment-blank").addClass("user-joined")
  $('.comments').prepend(message_html);
  console.log(data);
});

chatroom.disconnect( function(data) {
  var message_html = $('.comment-blank').clone();
  $(message_html).find(".author").hide();
  $(message_html).find(".text").text(data);
  $(message_html).removeClass("comment-blank");
  $('.comments').prepend(message_html);
});

chatroom.onlineUsers(function(online) {
  $(".online-users .menu").empty();
  $.each(online, function(index, user) {
    $(".online-users .menu").prepend($("<a/>").text(user.username).addClass("item"));
  });
});

chatroom.messages(function(message) {
  var message_html = $('.comment-blank').clone();
  $(message_html).find(".author").text(message.user);
  $(message_html).find(".text").text(message.msg);
  $(message_html).removeClass("comment-blank").addClass("comment");
  $('.comments').prepend(message_html);
});

$(".submit").on("click", function(e) {
  chatroom.sendMessage({user: username, msg: $("textarea").val(), room: storage.currentRoom})
  $("textarea").val(' ');
});

$('body').on('click', '.rooms .item', function(e) {
  var __this = $(this);
  room = __this.attr("href");
  storage.currentRoom = room;
  $("#inRoom").text(storage.currentRoom);
  $('.comment, .user-joined').remove();

  chatroom.changeRoom({room: room}, function(data) {
    console.log(data);
    console.log(room);
  });
  e.preventDefault();
});
