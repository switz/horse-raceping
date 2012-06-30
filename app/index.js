// Generated by CoffeeScript 1.3.3
var User, UserModel, app, assets, express, fs, getMS, http, io, mongoose, port, stylus;

express = require('express');

stylus = require('stylus');

assets = require('connect-assets');

http = require('http');

fs = require('fs');

mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/horse');

User = new mongoose.Schema({
  name: {
    type: String,
    "default": 'noob'
  },
  horse: {
    type: String,
    "default": 'http://'
  },
  bet: {
    type: Number,
    "default": 1
  },
  money: {
    type: Number,
    "default": 100
  }
});

UserModel = mongoose.model('User', User);

app = express.createServer();

app.use(assets());

app.use(express["static"](__dirname + '/../public'));

app.get('/', function(req, res) {
  return fs.readFile(__dirname + '/../public/index.html', function(err, data) {
    if (err) {
      console.log(err);
      res.end('Error, 500');
    }
    return res.end(data);
  });
});

app.get('/site/:site', function(req, res) {
  return getMS(req.params.site, function(json) {
    return res.send(json);
  });
});

app.post('/api/v1/name', function(req, res) {
  var u;
  u = new UserModel();
  u.name = req.query.name;
  u.save();
  return res.json(u);
});

app.post('/api/v1/bet', function(req, res) {
  var u;
  u = new UserModel();
  return u.findById(req.query.id, function(err, user) {
    var bet;
    if (!err) {
      bet = req.query.bet;
      if (bet > user.money) {
        res.json({
          error: 'Not enough money!'
        });
      }
      user.horse = req.query.horse;
      user.bet = req.query.bet;
      user.save();
      return res.json(user);
    }
  });
});

app.post('api/v1/endgame', function(req, res) {});

app.post('/startGame', function(req, res) {
  return 0;
});

getMS = function(site, callback) {
  var i, output, start, _results,
    _this = this;
  output = [];
  start = 100;
  i = start;
  _results = [];
  while (--i > 0) {
    start = new Date();
    _results.push(http.get({
      host: site,
      port: 80,
      agent: false
    }, function(res) {
      var length;
      length = new Date() - start;
      output.push({
        message: "Request took: " + length + ("ms (" + site + ")"),
        time: length,
        site: site,
        status: res.statusCode
      });
      if (output.length >= 99) {
        return callback(output);
      }
    }));
  }
  return _results;
};

port = process.env.PORT || process.env.VMC_APP_PORT || 4000;

app.listen(port, function() {
  return console.log("Listening on " + port);
});

io = require('socket.io').listen(app);

io.sockets.on("connection", function(socket) {
  socket.emit("news", {
    hello: "world"
  });
  return socket.on("connection", function(data) {
    var u;
    u = new UserModel();
    return u.findById(data.id, function(err, user) {
      var sid;
      if (!err) {
        sid = bet > user.money ? res.json({
          error: 'Not enough money!'
        }) : void 0;
        user.horse = req.query.horse;
        user.bet = req.query.bet;
        user.save();
        return res.json(user);
      }
    });
  });
});
