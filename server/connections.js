var enc = require(__dirname+"/enc.js");

var connections = function() {
  var self = this;
  self.connect = function(obj, callback) {
    obj.socket.on('login', function(objLogin) {
      obj.socket.username = objLogin.username;

      var secrectKey = enc.reEncrypt(enc.genSerectKey());
      if(typeof obj.onlineUsers[objLogin.nsp] === "undefined") {
        obj.onlineUsers[objLogin.nsp] = [{username: objLogin.username, index: 0}];
        obj.socket.onlineUserArrayIndex = 0;
        obj.onlinesecrectKeys[objLogin.nsp] = [];
        obj.onlinesecrectKeys[objLogin.nsp][obj.socket.id] = {"key": secrectKey};
      } else {
        obj.socket.onlineUserArrayIndex = obj.onlineUsers[objLogin.nsp].length;
        obj.onlineUsers[objLogin.nsp].push({username: objLogin.username, index: obj.onlineUsers[objLogin.nsp].length});
        obj.onlinesecrectKeys[objLogin.nsp][obj.socket.id] = {"key": secrectKey};
      }
      self.update({io: obj.io, onlineUsers: obj.onlineUsers[objLogin.nsp]});
      callback(obj.onlineUsers[objLogin.nsp], obj.onlinesecrectKeys[objLogin.nsp][obj.socket.id].key);
    });
    obj.onlineUsersCount++;
  };

  self.disconnect = function(obj, callback) {
    callback(obj.socket.username);
    obj.onlineUsers[obj.socket.nsp.name].splice(obj.onlineUsers[obj.socket.nsp.name].indexOf(obj.socket.onlineUserArrayIndex), 1);
    self.update({io: obj.io, onlineUsers: obj.onlineUsers[obj.socket.nsp.name]});
  };

  self.update = function(obj) {
    obj.io.emit('onlineUsers', obj.onlineUsers);
  }

};

module.exports = connections;
