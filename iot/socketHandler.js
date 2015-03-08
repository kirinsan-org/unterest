var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  io = require('socket.io-client');

function SocketHandler(userId) {

  var socket = this.socket = io('http://unterest.cloudapp.net');
  var self = this;
  this.userId = userId;

  socket.on('user.help', function(data) {
    self.target = data.source;
    self.emit('user.help', data);
  });

  socket.on('user.thankYou', function(data) {
    self.emit('user.thankYou', data);
  });

  socket.on('user.cancel', function(data) {
    self.emit('user.cancel', data);
  });
}

util.inherits(SocketHandler, EventEmitter);

/**
 * トイレを使って良い時に呼ぶ。
 */
SocketHandler.prototype.accept = function() {
  this.socket.emit('owner.response', {
    result: true,
    target: this.target,
    userId: this.userId
  });
};

/**
 * 拒否する時に呼ぶ。
 */
SocketHandler.prototype.deny = function() {
  this.socket.emit('owner.response', {
    result: false,
    target: this.target,
    userId: this.userId
  });
};

module.exports = SocketHandler;
