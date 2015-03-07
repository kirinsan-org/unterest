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
  .get('/user/:id', function(req, res, next) {

    return db.user.findOne({
      id: req.params.id
    }, {
      _id: 0,
      __v: 0,
      'toilet.photo': 0
    }).lean().exec().then(function(data) {
      res.json(data);
    }, next);
  })
