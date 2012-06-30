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


# Get root_path return index view
app.get '/', (req, res) -> 
  output = getMS 'phishvids.com'
  res.render 'index'

app.get '/site/:site', (req, res) ->
  getMS req.params.site, (output) ->
    res.json output

getMS = (site, callback) ->
  start = new Date()
  http.get
    host: site
    port: 80
  , (res) =>
    length = new Date() - start
    callback 
      message: "Request took: " + length + "ms (#{site})"
      time: length
      site: site
      status: res.statusCode





# Define Port
port = process.env.PORT or process.env.VMC_APP_PORT or 8000
# Start Server
app.listen port, -> console.log "Listening on #{port}"