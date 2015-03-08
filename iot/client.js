var SocketHandler = require('./socketHandler');

var handler = new SocketHandler('2');

/**
 *
 */
handler.on('user.help', function() {

  setTimeout(function() {

    var result = Math.random() > 0.5;

    if (result) {
      handler.accept();
    } else {
      handler.deny();
    }
  }, 3000);
});

/**
 * ここへ行くと決めた時。
 * data.source : 送信元ユーザーの socket.id
 * data.userId : 利用者のユーザーID
 */
handler.on('user.thankYou', function(data) {
  console.log(data);
});

/**
 * 行かなくてよくなった時。
 * data.source : 送信元ユーザーの socket.id
 * data.userId : 利用者のユーザーID
 */
handler.on('user.cancel', function(data) {
  console.log(data);
});
