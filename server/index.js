var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var path = require('path');
var Sequelize = require('sequelize');

var public = path.join(__dirname, '/../client/assets/');

/*var sequelize = new Sequelize('database', 'username', 'password', {
  host: 'localhost',
  dialect: 'mysql'
});



console.log(sequelize);*/

var axios = require('axios');

var onlineUsers = {}, onlineUsersCount = 0, onlinesecrectKeys = {};

var connections = require(__dirname+"/connections.js");
var connections = new connections();

var messages = require(__dirname+"/messages.js");
var messages = new messages();

var rooms = require(__dirname+"/rooms.js");
var rooms = new rooms();

var events = require(__dirname+"/events.js");
var events = new events();

app.use('/assets',express.static(public));

var chat = path.join(__dirname, '/../client/');
app.use('/', express.static(chat));

io.of(/[A-Za-z]/).on('connection', function(socket) {

  const nsp = socket.nsp;
  
  /*const res = axios.get('https://domain.com/wp-json/wp/v2/licenses_key/', {
  auth: {
    username: '',
    password: ''
  },
  proxy: false
  }) .then(function (response) {
    response.data.forEach(function(item) {
      if("/"+item.domain_install_path !== nsp.name) {
        io.origins((origin, callback) => {
          return callback('origin not allowed', false);
          //callback(null, true);
        });
        return;
      }
    });
  })*/

  connections.connect({io: nsp, socket: socket, onlineUsers: onlineUsers, onlineUsersCount: onlineUsersCount, onlinesecrectKeys: onlinesecrectKeys}, function(obj, secrectKey) {
    var currentRoom = "";
    rooms.join({io: io, socket: socket}, function(object) {
      socket.room = object.room;

      rooms.change({io: io, socket: socket, currentRoom: socket.room}, function(object) {
        console.log(object);
      });

      //console.log(currentRoom);

      events.join({io: io, socket: socket, username: object.user, room: socket.room});

      messages.send({io: io, socket: socket, secrectKey: secrectKey});

      socket.on('disconnect', function() {
        connections.disconnect({io: nsp, socket: socket, onlineUsers: onlineUsers}, function(user) {
          onlineUsersCount--;
          events.exit({io: io, socket: socket, username: user, room: socket.room});
        });

      });

    });

  });

});

http.listen(process.env.PORT || 5000, function() {
  console.log('listening on *:'+process.env.PORT || 5000);
});
