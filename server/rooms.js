var rooms = function() {
  var self = this;

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
