var messages = function() {
  var self = this;

  self.send = function(obj, callback) {

    obj.socket.on('sendMessage', function(message) {
      obj.io.of(obj.socket.nsp.name).to(obj.room).emit('updateMessages', message);
    });

  };


};

module.exports = messages;
