var enc = require(__dirname+"/enc.js");

var connections = function() {
  var self = this;
  self.connect = function(obj, callback) {
    obj.socket.on('login', function(objLogin) {
      obj.socket.username = objLogin.username;
      var secrectKey = enc.reEncrypt(enc.genSerectKey());
      obj.onlineUsers.push({username: objLogin.username});
      obj.onlinesecrectKeys[obj.socket.id] = {"key": secrectKey};
      self.update({io: obj.io, onlineUsers: obj.onlineUsers});
      callback(obj.onlineUsers, obj.onlinesecrectKeys[obj.socket.id].key);
    });
    obj.onlineUsersCount++;
  };

  self.disconnect = function(obj, callback) {
    callback(obj.socket.username);
    var users = obj.onlineUsers.findIndex(user => user.username === obj.socket.username);
    obj.onlineUsers.splice(users, 1);
    self.update({io: obj.io, onlineUsers: obj.onlineUsers});
  };

  self.update = function(obj) {
    obj.io.emit('onlineUsers', obj.onlineUsers);
  }

};

module.exports = connections;
