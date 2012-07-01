express = require 'express'
stylus = require 'stylus'
assets = require 'connect-assets'
http = require 'http'
fs = require 'fs'
mongoose = require 'mongoose'
scores = {}
users = []
gameStarted = false
querystring = require 'querystring'

sites = 
  'Meetup' : 'meetup.com'
  'Github' : 'github.com'
  'jQuery' : 'jquery.com'
  'Yahoo' : 'yahoo.com'
  'Underscore' : 'underscorejs.org'
  'LoDash' : 'lodash.com'

sitesArray = [
  name: 'Meetup'
  url: "meetup.com"
,
  name: 'Github'
  url: "github.com"
,
  name: 'jQuery'
  url: "jquery.com"
,
  name: 'Yahoo'
  url: "yahoo.com"
,
  name: 'Underscore'
  url: "underscorejs.org"
,
  name: 'LoDash'
  url: "lodash.com"
 ]

mongoose.connect 'mongodb://localhost/horse'

User = new mongoose.Schema
  name: 
    type: String
    default: 'noob'
  horse:
    type: String
    default: 'meetup.com'
  bet:
    type: Number
    default: -1
  money:
    type: Number
    default: 100

Horse = new mongoose.Schema
  name: 
    type: String
    default: 'meetup.com'
  odds:
    type: String
    default: "1/1"

UserModel = mongoose.model 'User', User

app = express.createServer()

# Add Connect Assets
app.use assets()
app.use express.static(__dirname + '/../public')
# Set View Engine
#app.set 'view engine', 'jade'

io = require('socket.io').listen app

############################
##                        ##
## The actual fucking app ##
##                        ##
############################


# Get root_path return index view
app.get '/', (req, res) -> 
  fs.readFile __dirname + '/../public/index.html', (err, data) ->
    if err
      console.log err
      res.end 'Error, 500'

    res.end data
  

app.get '/site/:site', (req, res) ->
  getMS req.params.site, (json) ->
    res.json json

app.get '/api/v1/horses', (req, res) ->
  res.json sitesArray

app.post '/api/v1/name', (req, res) ->
  u = new UserModel()
  u.name = querystring.escape req.query.name
  u.save()
  res.json u
  

app.post '/api/v1/endgame', (req, res) ->
  0

# Admin shit

app.get '/startGamePhish', (req, res) ->
  gameStarted = true
  runSites ->
    for h1 of scores
      for h2 of scores
        if h1 isnt h2
          diffMean = scores[h1].mean - scores[h2].mean
          h1std = scores[h1].stdDev
          h2std = scores[h2].stdDev
          diffStd = Math.sqrt(h1std*h1std + h2std*h2std)

    io.sockets.emit 'startGame',
      scores
    res.json scores

getMS = (site, callback) ->
  output = []
  ms = 0
  start = 100
  i = start
  while --i > 0
    start = new Date()
    http.get
      host: site
      port: 80
      agent: false
    , (res) =>
      length = new Date() - start
      ms += length
      output.push
        message: "Request took: " + length + "ms (#{site})"
        time: length
        site: site
        status: res.statusCode
      if output.length is 99
        callback site, ms/100, output

standardDeviation = (avg, arr, callback) ->
  total = 0
  i = arr.length
  while --i >= 0
    save = (arr[i].time - avg)
    total += save*save
    if i is 0
      callback Math.sqrt total / 100

runSites = (callback) ->
  scores = {}
  i = 0
  for s of sites
    current = sites[s]
    getMS current, (title, avg, obj) ->
      standardDeviation avg, obj, (total) ->
        scores[title] = 
          stdDev: total
          mean: avg
          #output: obj
        if ++i is 6
          callback()

# Define Port
port = process.env.PORT or process.env.VMC_APP_PORT or 4000

# Start Server
app.listen port, -> console.log "Listening on #{port}"

io.sockets.on "connection", (socket) ->

  socket.on "connection", (data) ->
    u = new UserModel()
    u.findById data.id, (err, user) ->
      unless err
        user.horse = req.query.horse
        user.bet = req.query.bet
        user.save()
        res.json user

  socket.on 'bet', (data) ->
    u = mongoose.model('User')
    if gameStarted
      socket.emit 'error',
        error: 'Game Started, sorry!'
    u.findById data.user._id, (err, user) ->
      unless err
        bet = data.bet
        if bet > user.money || bet < 1
          socket.emit 'error',
            error: 'Not enough money!'
        user.horse = data.horse.url
        user.bet = data.bet
        user.save()
        users.push 
          name: data.user.name
          horse: data.horse
          bet: data.bet
        io.sockets.emit 'new_bet',
          users