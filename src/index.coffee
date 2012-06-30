express = require 'express'
stylus = require 'stylus'
assets = require 'connect-assets'
http = require 'http'
fs = require 'fs'
mongoose = require 'mongoose'

mongoose.connect 'mongodb://localhost/horse'

User = new mongoose.Schema
  name: 
    type: String
    default: 'noob'
  horse:
    type: String
    default: 'http://'
  bet:
    type: Number
    default: 1
  money:
    type: Number
    default: 100

UserModel = mongoose.model 'User', User

app = express()
# Add Connect Assets
app.use assets()
app.use(express.static(__dirname + '/../public'));
# Set View Engine
app.set 'view engine', 'jade'

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
    res.send json

app.post '/api/v1/name', (req, res) ->
  u = new UserModel
    name: req.params.name
  u.save()

getMS = (site, callback) ->
  output = []
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
      output.push
        message: "Request took: " + length + "ms (#{site})"
        time: length
        site: site
        status: res.statusCode
      if output.length >= 99
        callback output



# Define Port
port = process.env.PORT or process.env.VMC_APP_PORT or 4000
# Start Server
app.listen port, -> console.log "Listening on #{port}"