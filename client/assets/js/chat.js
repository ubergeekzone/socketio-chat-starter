var nsp = prompt("What's your namespace?")
var socket = io("http://localhost:3000/"+nsp, {transports: ['websocket'], upgrade: false});
var username = "";


function startup(domain, callback) {
  callback(domain)
}

startup("/"+nsp, function(domain) {

  socket.on('connect', function () {
    username = prompt("What's your name?");

    socket.emit('login', {nsp: domain, username: username});

    socket.emit('joinRoom', {user: username, room: "public"});

  });


  $(".actions button").on("click", function(e) {
    socket.emit('sendMessage', {user: username, msg: $("textarea").val()});
    $("textarea").val(' ');
  });

  socket.on('nsp', (data) => {
    console.log(data);
  });

  socket.on('updateMessages', (data) => {
    $('.welcome').hide();

    var message = $('.message').clone()
    $(message).find(".from").text(data.username);
    $(message).find("span").text(data.msg);
    $(message).removeClass("message");

    $('.chat').prepend(message);

    console.log(data);
  });

  socket.on('join', (data) => {
    console.log(data);
  });

  socket.on('exit', (data) => {
    console.log(data);
  });


  socket.on('disconnect', function(onlineUsers) {
  });

  socket.on('onlineUsers', function(onlineUsers){
    $("ul").empty();
    $.each(onlineUsers, function(index, user) {
      $(".online ul").prepend($("<li/>").text(user.username))
    });
  });

});
