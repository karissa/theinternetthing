var from = require('from2')
var pump = require('pump')
var through = require('through2')
var Twitter = require('twitter')
var debug = require('debug')('theinternetthing')

var convert = require('./convert.js')
var server = require('../server/server.js')
var rate = require('./rate.js')

var client = new Twitter({
  consumer_key: process.env.TWITTER_KEY,
  consumer_secret: process.env.TWITTER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET
})

var Query = server.models.Query
Query.find({ where: { running: 'true' } }, function (err, queries) {
  if (err) throw err
  for (var i in queries) {
    var query = queries[i]
    var includes = query.params.includes.map(function (item) { return item.value })
    var opts = {
      q: includes.join(',')
    }
    scrapeSearch(query, opts)
  }
})

function scrapeSearch (query, opts) {
  debug('waiting for 5 sec')
  setTimeout(function () {
    search(query, opts, function (err, since_id) {
      if (err) console.error(err)
      opts.since_id = since_id
      scrapeSearch(query, opts)
    })
  }, 5000)
}

function search (query, opts, cb) {
  debug('searching for', opts)
  opts.result_type = 'recent'
  client.get('search/tweets', opts, function (err, data, response) {
    if (err) {
      if (err[0].code === 88) {
        return rate(client, 'search', function (err, data, response) {
          if (err) console.error(err)
          var reset = data.resources.search['/search/tweets'].reset
          var diff = new Date(reset * 1000) - new Date() + 500
          debug('waiting for', diff / 1000, 'sec')
          setTimeout(function () { cb(null, opts.since_id) }, diff)
        })
      }
      return cb(err)
    }
    debug('got', data.statuses.length, 'tweets')
    if (data.statuses.length === 0) return cb(null, opts.since_id)

    var tweetStream = from.obj(data.statuses)
    var since_id = data.statuses[0].id
    var saveTweets = through.obj(function (data, enc, next) {
      var tweet = convert(data)
      query.tweets.create({data: tweet}, next)
    })
    pump(tweetStream, saveTweets, function (err) {
      if (err) return cb(err)
      return cb(null, since_id)
    })
  })
}
