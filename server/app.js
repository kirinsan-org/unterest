global.db = require('./db');

var express = require('express');
var bodyParser = require('body-parser')
var app = express();

app.use(bodyParser.json());
app.use('/api', require('./api.js'));
app.use(express.static(__dirname + '/www'));

app.listen(80);
