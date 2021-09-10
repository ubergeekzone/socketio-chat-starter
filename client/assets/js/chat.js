class WP_Chatkit {

  constructor(nsp) {
    this.domain = window.location.protocol+"//"+window.location.hostname+":"+window.location.port;
    this.nsp = '/'+window.location.hostname;
    this.socket = io("https://wp-chatkit.herokuapp.com"+this.nsp, {transports: ['websocket'], upgrade: false});
    //this.socket = io("http://localhost:5000"+nsp, {transports: ['websocket'], upgrade: false});

    this.socket.on('connect_error', function(error) {
      console.log(error);
    });
  }


  connect(username) {
    this.socket.on('connect', function() {
    });
    this.socket.emit('login', {nsp: this.nsp, username: username});
  }

  disconnect(callback) {
    this.socket.on('exit', function (data) {
      callback(data);
    });
  }

  auth(username, callback) {
    callback(username);
    return username;
  }

  changeRoom(object, callback) {
    this.socket.emit('changeRoom', object);
    this.socket.on('change', function (data) {
      callback(data);
    });
  }

  joinRoom(object, callback) {
    this.socket.emit('joinRoom', object);
    this.socket.on('join', function (data) {
      callback(data);
    });
  }

  onlineUsers(callback) {
    this.socket.on('onlineUsers', function(onlineUsers) {
      callback(onlineUsers);
    });
  }

  messages(callback) {
    this.socket.on('updateMessages', function(message) {
      console.log(message);
      message  = jQuery.parseJSON(message);
      callback(message);
    });
  }

  sendMessage(object) {
    this.socket.emit('sendMessage', object);
  }

}
