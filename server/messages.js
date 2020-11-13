var enc = require(__dirname+"/enc.js");

/*var s = enc.encrypt("i am here");
console.log(s);
var ss = enc.decrypt(s);
console.log(ss);*/

var messages = function() {
  var self = this;

  self.send = function(obj, callback) {

    obj.socket.on('sendMessage', function(message) {
      message_encrypt = enc.encrypt(JSON.stringify(message), obj.secrectKey);
      //db insert goes here
      message_decrypt = enc.decrypt(message_encrypt,  obj.secrectKey);
      var from = obj.socket.room.split("-");
      var to = obj.socket.room;
      if(from[1] === obj.socket.username) {
        to = from[1]+"-"+from[0];
        obj.io.of(obj.socket.nsp.name).to(to).to(obj.socket.room).emit('updateMessages', message_decrypt);
        return false;
      }
      obj.io.of(obj.socket.nsp.name).to(obj.socket.room).emit('updateMessages', message_decrypt);
    });

  };


};

module.exports = messages;
