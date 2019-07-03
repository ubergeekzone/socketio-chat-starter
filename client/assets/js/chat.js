class WP_Chatkit {

  constructor(nsp) {
    this.domain = window.location.protocol+"//"+window.location.hostname+":"+window.location.port;
    this.nsp = nsp;
    this.socket = io("http://localhost:3003"+nsp, {transports: ['websocket'], upgrade: false});
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

var chatroom = new WP_Chatkit('/XLNZqA4oAx');

var username = chatroom.auth(prompt("What's your name?"), function(username) {
  chatroom.connect(username);
});

chatroom.joinRoom({user: username, room: "public"}, function(data) {
  var message_html = $('.comment-blank').clone();
  $(message_html).find(".author").hide();
  $(message_html).find(".text").text(data);
  $(message_html).removeClass("comment-blank");
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
  $(message_html).removeClass("comment-blank");
  $('.comments').prepend(message_html);
});

$(".submit").on("click", function(e) {
  chatroom.sendMessage({user: username, msg: $("textarea").val()})
  $("textarea").val(' ');
});