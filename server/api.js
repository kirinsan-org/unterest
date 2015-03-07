var express = require('express');
var router = module.exports = express.Router();

router
/**
 * 位置情報からトイレを検索する。
 */
  .get('/toilet/@:lat,:lng', function(req, res, next) {

  var lng = Number(req.params.lng);
  var lat = Number(req.params.lat);

  return db.user.findByLocation(lng, lat).then(function(data) {
    res.json(data);
  }, next);
})
