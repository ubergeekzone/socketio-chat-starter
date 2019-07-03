class WP_Chatkit {

  constructor(nsp) {
    this.domain = window.location.protocol+"//"+window.location.hostname+":"+window.location.port;
    this.nsp = nsp;
    this.socket = io("http://localhost:3002"+nsp, {transports: ['websocket'], upgrade: false});
    this.socket.on('connect_error', function(error) {
      console.log(error);
    });

    if(!localStorage.getItem("secrectKey")) {
      var secrectQuestion = window.location.hostname;
      var secrectKey = CryptoJS.PBKDF2(secrectQuestion, CryptoJS.lib.WordArray.random(128 / 8), { keySize: 128/32, iterations: 1000 });
      localStorage.setItem("secrectKey",secrectKey.toString(CryptoJS.enc.Hex));
      this.secrectKey = secrectKey;
    } else {
      this.secrectKey = localStorage.getItem("secrectKey");
    }
  }

  connect(username) {
    this.socket.on('connect', function() {
    });
    this.socket.emit('login', {nsp: this.nsp, username: username, secrectKey: this.secrectKey});
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
      message  = chatroom.decrypt(message);
      message  = $.parseJSON(message);
      callback(message);
    });
  }

  sendMessage(object) {
    this.socket.emit('sendMessage', object);
  }

  decrypt(hex) {
    hex =  hex.split(":");
    const iv = CryptoJS.enc.Hex.parse(hex[0]);
    //const key = CryptoJS.enc.Utf8.parse("4383f7b38a6971d2cdac781d75ff1dc1");
    return CryptoJS.AES.decrypt(hex[1],  CryptoJS.enc.Utf8.parse(this.secrectKey), {
      iv,
      mode: CryptoJS.mode.CBC,
      format: CryptoJS.format.Hex
    }).toString(CryptoJS.enc.Utf8);    
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