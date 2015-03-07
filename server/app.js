global.db = require('./db');

var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use('/api', require('./api.js'));
app.use(express.static(__dirname + '/www'));

io.on('connection', function(socket) {

  /**
   * ユーザーIDとsocket.idの対応付けを行う
   */
  // socket.emit('getUserId', function(userId) {
  //   db.user.update({
  //     id: userId
  //   }, {
  //     socketId: socket.id
  //   });
  // })

  /**
   * 助けを求める
   * data.geolocation : ユーザーの位置
   * data.userId : ユーザーID
   */
  socket.on('user.help', function(data) {

    // TODO 位置情報で絞込
    socket.broadcast.emit('user.help', {
      source: socket.id,
      userId: data.userId,
      geolocation: data.geolocation
    });
  });

  /**
   * トイレ所有者が利用可否を返答する時。
   * data.target : 元々 user.help を送ったsocketのID
   * data.result : Boolean 受け入れ可否
   * data.userId : トイレ所有者のユーザーID
   */
  socket.on('owner.response', function(data) {

    // user.helpを送ったsocketに戻す
    socket.broadcast.to(data.target).emit('owner.response', {
      source: socket.id,
      result: data.result,
      userId: data.userId
    });
  });

  /**
   * ここへ行くと決めた時。
   * data.target : owner.response を送った人の socket.id
   * data.userId : 利用者のユーザーID
   */
  socket.on('user.thankYou', function(data) {

    // owner.response を送ったsocketに戻す
    socket.broadcast.to(data.target).emit('user.thankYou', {
      source: socket.id,
      userId: data.userId
    });
  });

  /**
   * 行かなくてよくなった時。
   * data.target : owner.response を送った人の socket.id
   * data.userId : 利用者のユーザーID
   */
  socket.on('user.cancel', function(data) {

    // TODO 絞込
    socket.broadcast.emit('user.cancel', {
      source: socket.id,
      userId: data.userId
    });
  });
});

server.listen(80);
