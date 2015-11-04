var from = require('from2')
var pump = require('pump')
var through = require('through2')
var forever = require('twitter-forever')
var debug = require('debug')('collect')

var convert = require('./convert.js')
var server = require('../server/server.js')

var client = {
  consumer_key: process.env.TWITTER_KEY,
  consumer_secret: process.env.TWITTER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET
}

var RUNNING = {}

var Query = server.models.Query

getQueries()

function getQueries () {
  Query.all(function (err, queries) {
    if (err) throw err
    for (var i in queries) {
      var query = queries[i]
      if (!RUNNING[i] && query.running) {
        RUNNING[i] = search(query)
        debug('starting', query)
      }
      if (RUNNING[i] && !query.running) {
        RUNNING[i].destroy()
        RUNNING[i] = undefined
        debug('stopping', query)
      }
    }
    setTimeout(getQueries, 2000)
  })
}

function search (query) {
  var includes = query.params.includes.map(function (item) { return item.value })
  var opts = {
    q: includes.join(',')
  }
  var searcher = forever(client, opts)
  searcher.on('data', function (tweets) {
    var tweetStream = from.obj(tweets)
    var saveTweets = through.obj(function (data, enc, next) {
      var tweet = convert(data)
      query.tweets.create({data: tweet}, next)
    })
    pump(tweetStream, saveTweets, function (err) {
      if (err) console.error('boo', err)
    })
  })
  searcher.on('error', function (err) {
    console.error(err)
  })
  return searcher
}
