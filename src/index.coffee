express = require 'express'
stylus = require 'stylus'
assets = require 'connect-assets'
http = require 'http'

app = express()
# Add Connect Assets
app.use assets()
# Set View Engine
app.set 'view engine', 'jade'

############################
##                        ##
## The actual fucking app ##
##                        ##
############################

pages =
  main:
    url: "/"
    weight: 3

  search:
    url: "/search?q=test"
    weight: 1

  notFound:
    url: "/notfound"
    weight: 1

engines =
  google: "https://www.google.com"
  bing: "http://www.bing.com"


# Get root_path return index view
app.get '/', (req, res) -> 
  output = getMS 'phishvids.com'
  res.render 'index'

app.get '/site/:site', (req, res) ->
  getMS req.params.site, (json) ->
    res.send json

getMS = (site, callback) ->
  output = []
  start = 100
  i = start
  while --i > 0
    start = new Date()
    http.get
      host: site
      port: 80
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