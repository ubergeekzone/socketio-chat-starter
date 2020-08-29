var events = function() {
  var self = this;

  self.exit = function(obj) {
       obj.io.of(obj.socket.nsp.name).to(obj.room).emit('exit', obj.username+' has went offline'); // broadcast to everyone in the room
  };

  self.join = function(obj) {
       obj.io.of(obj.socket.nsp.name).to(obj.room).emit('join', obj.username+' has joined room'); // broadcast to everyone in the room
  };

  self.change = function(obj) {
       obj.io.of(obj.socket.nsp.name).to(obj.room).emit('change', obj.username+' has changed room'); // broadcast to everyone in the room
  };


};

module.exports = events;
