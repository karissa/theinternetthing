var from = require('from2')
var pump = require('pump')
var through = require('through2')
var twitter = require('twitter-forever')
var tumblr = require('tumblr')
var debug = require('debug')('collect')

var tweet = require('./tweet.js')
var server = require('../server/server.js')
var clients = require('../common/models/clients.js')

var RUNNING = {}

var Query = server.models.Query

getQueries()

function getQueries () {
  Query.all(function (err, queries) {
    if (err) throw err
    for (var i in queries) {
      var query = queries[i]
      if (!RUNNING[i] && query.running) {
        RUNNING[i] = searchTwitter(query)
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

function getText (query) {
  var includes = query.params.includes.map(function (item) { return item.value })
  return includes.join(',')
}

function searchTwitter (query) {
  var opts = {
    q: getText(query)
  }
  var searcher = twitter(clients.twitter, opts)
  searcher.on('data', function (tweets) {
    var tweetStream = from.obj(tweets)
    var saveTweets = through.obj(function (data, enc, next) {
      query.tweets.create({data: tweet(data)}, next)
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

function searchTumblr (query, cb) {
  var searcher = new tumblr.Tagged(clients.tumblr)
  var tag = getText(query)
  doit({})
  function doit (opts) {
    searcher.search(tag, opts, function (err, results) {
      if (err) return console.error(err)
      if (results.length === 0) return
      var next_timestamp = 0
      var posts = from.obj(results)
      var timestamps = through.obj(function (data, enc, next) {
        if (next_timestamp < data.timestamp) next_timestamp = data.timestamp
        next(null, data)
      })
      pump(posts, timestamps, function (err) {
        if (err) return console.error(err)
        var opts = { next_timestamp: next_timestamp }
        console.log(opts)
      })
    })
  }
}
