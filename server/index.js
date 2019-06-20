var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var public = path.join(__dirname, '/../client/assets/');

var onlineUsers = {}, onlineUsersCount = 0;

var connections = require(__dirname+"/connections.js");
var connections = new connections();

var messages = require(__dirname+"/messages.js");
var messages = new messages();

var rooms = require(__dirname+"/rooms.js");
var rooms = new rooms();

var events = require(__dirname+"/events.js");
var events = new events();

app.use('/assets',express.static(public))

app.get('/', function(req, res) {
  res.sendFile('client/index.html', {
    root: '.'
  });
});

console.log(public);



io.of(/[A-Za-z]/).on('connection', function(socket) {

  const nsp = socket.nsp;

  connections.connect({io: nsp, socket: socket, onlineUsers: onlineUsers, onlineUsersCount: onlineUsersCount}, function(obj) {
    var currentRoom = "";
    rooms.join({io: io, socket: socket}, function(object) {
      currentRoom = object.room;

      events.join({io: io, socket: socket, username: object.user, room: currentRoom});

      messages.send({io: io, socket: socket, room:currentRoom});

      socket.on('disconnect', function() {
        connections.disconnect({io: nsp, socket: socket, onlineUsers: onlineUsers}, function(user) {
          onlineUsersCount--;
          events.exit({io: io, socket: socket, username: user, room: currentRoom});
        });

      });

    });

  });

});

http.listen(3000, function() {
  console.log('listening on *:3000');
});
