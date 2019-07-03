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
      obj.io.of(obj.socket.nsp.name).to(obj.room).emit('updateMessages', message_encrypt);
    });

  };


};

module.exports = messages;
