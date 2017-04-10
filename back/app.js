"use strict";
var express = require('express');
var bodyParser  = require('body-parser');


var	user = require('./module/user_gateway');

var app = express();
var port = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, token, Accept");
  next();
});


app.options('/api/*', function (request, response, next) {
    response.header("Access-Control-Allow-Methods", "GET");
    response.send();
});


app.post('/connexion', user.Connexion);


app.listen(port);
console.log('SERVICE WORKSHOP 2 - Listening on port ' + port + '...');