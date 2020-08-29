var rooms = function() {
  var self = this;

  self.change = function(obj, callback) {

    obj.socket.on("changeRoom", function(object) {
      obj.socket.leave(obj.socket.room);
      obj.socket.join(object.room);
      obj.socket.room = object.room;
      callback(object);
    })


  },

  self.join = function(obj, callback) {

    obj.socket.on("joinRoom", function(object) {
      obj.socket.join(object.room, () => {
       let rooms = Object.keys(obj.socket.rooms);
       callback(object);
      });
    })

  };


};

module.exports = rooms;
