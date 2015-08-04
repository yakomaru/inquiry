var request = require('request');
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var port = parseInt(process.env.PORT) || 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/src/app.js', function(req, res) {
  res.sendFile(__dirname + '/src/app.js');
});

app.get('/style/style.css', function(req, res) {
  res.sendFile(__dirname + '/style/style.css');
});

app.get('/style/favicon.ico', function(req, res) {
  res.sendFile(__dirname + '/style/favicon.ico');
});

app.post('/', function(req, res) {
  request(req.body.site, function(error, response, body) {
    res.send(body);
  });
});

var server = app.listen(port, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Inquiry server listening at http://%s:%s', host, port);
});