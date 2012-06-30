express = require 'express'
stylus = require 'stylus'
assets = require 'connect-assets'
http = require 'http'
fs = require 'fs'
mongoose = require 'mongoose'
scores = {}
gameStarted = false

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
  u.name = req.query.name
  u.save()
  res.json u

app.post '/api/v1/bet', (req, res) ->
  u = new UserModel()
  if gameStarted
    res.json
      error: 'Game Started, sorry!'
  u.findById req.query.id, (err, user) ->
    unless err
      bet = req.query.bet
      if bet > user.money || bet < 1
        res.json
          error: 'Not enough money!'
      user.horse = req.query.horse
      user.bet = req.query.bet
      user.save()
      io.sockets.emit 'new_bet',
        name: data.name
        horse: data.horse
        bet: data.bet
      res.json user

app.post '/api/v1/endgame', (req, res) ->
  0

# Admin shit

app.get '/startGamePhish', (req, res) ->
  io.sockets.emit 'startGame', true
  gameStarted = true
  runSites ->
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
          output: obj
        console.log total
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
        sid = 
        if bet > user.money
          res.json
            error: 'Not enough money!'
        user.horse = req.query.horse
        user.bet = req.query.bet
        user.save()
        res.json user
