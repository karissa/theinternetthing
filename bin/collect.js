var from = require('from2')
var pump = require('pump')
var through = require('through2')
var debug = require('debug')('theinternetthing')

var search = require('./search.js')
var convert = require('./convert.js')
var server = require('../server/server.js')

var client = {
  consumer_key: process.env.TWITTER_KEY,
  consumer_secret: process.env.TWITTER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_SECRET
}

var Query = server.models.Query
Query.find({ where: { running: 'true' } }, function (err, queries) {
  if (err) throw err
  for (var i in queries) {
    var query = queries[i]
    var includes = query.params.includes.map(function (item) { return item.value })
    var opts = {
      q: includes.join(',')
    }
    var searcher = search(client, opts)
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
  }
})
