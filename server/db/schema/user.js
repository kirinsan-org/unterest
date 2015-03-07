var mongoose = require('mongoose');
var schema = module.exports = new mongoose.Schema({
  id: Number,
  socketId: String,
  screenName: String,
  review: [{
    reviewer: Number,
    title: String,
    note: String,
    rate: Number
  }],

  toilet: {
    geolocation: {
      type: [Number],
      index: '2d'
    },
    name: String,
    photo: {
      // type: {
      //   type: String
      // },
      data: Buffer
        // title: String
    },
    note: String,
    tag: {
      type: [String],
      index: true
    }
  }
});

schema.statics.findBySocketId = function(socketId) {

  return this.findOne({
    socketId: socketId
  }, {
    id: 1
  }).lean().exec();
}

schema.statics.findByLocation = function(lng, lat) {

  return this.find({
    'toilet.geolocation': {
      $near: [lng, lat],
      $maxDistance: 1 / 111.12
    }
  }, {
    _id: 0,
    __v: 0,
    review: 0,
    'toilet.photo': 0
  }).lean().exec().then(function(users) {

    return users.map(function(user) {

      user.distance = calcDistance(user.toilet.geolocation[1], user.toilet.geolocation[0], lat, lng);

      return user;
    });
  });
};

function calcDistance(lat1, lon1, lat2, lon2) {
  //ラジアンに変換
  var a_lat = lat1 * Math.PI / 180;
  var a_lon = lon1 * Math.PI / 180;
  var b_lat = lat2 * Math.PI / 180;
  var b_lon = lon2 * Math.PI / 180;

  // 緯度の平均、緯度間の差、経度間の差
  var latave = (a_lat + b_lat) / 2;
  var latidiff = a_lat - b_lat;
  var longdiff = a_lon - b_lon;

  //子午線曲率半径
  //半径を6335439m、離心率を0.006694で設定してます
  var meridian = 6335439 / Math.sqrt(Math.pow(1 - 0.006694 * Math.sin(latave) * Math.sin(latave), 3));

  //卯酉線曲率半径
  //半径を6378137m、離心率を0.006694で設定してます
  var primevertical = 6378137 / Math.sqrt(1 - 0.006694 * Math.sin(latave) * Math.sin(latave));

  //Hubenyの簡易式
  var x = meridian * latidiff;
  var y = primevertical * Math.cos(latave) * longdiff;

  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}
