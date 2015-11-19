var fs = require('fs')
var path = require('path')
var queries = require('../models')('queries')

function Query () {
  return {
    name: '',
    params: {
      includes: [],
      excludes: []
    }
  }
}

var query = null

function updateQuery (id, cb) {
  queries.get(id, function (err, resp, body) {
    if (err) console.error(err)
    query = body
    cb({query: query})
  })
}
module.exports = {
  url: '/query/:id',
  data: function (params, cb) {
    query = Query()
    var data = {query: query}
    if (params.id === 'new') return cb(data)
    updateQuery(params.id, cb)
  },
  template: fs.readFileSync(path.join(__dirname, '../templates/query.html')).toString(),
  onrender: function () {
    var self = this

    function createTweetChart (tweets) {
      console.log(transformTweets(tweets))
    }

    function transformTweets (tweets) {
      var values = []
      for (var i in tweets) {
        var tweet = tweets[i]
        values.push({x: tweet.data.created_at, y: tweet.data.text.length})
      }
      return [
        {
          values: values,
          key: 'Tweets'
        }
      ]
    }

    function Keyword (value) {
      return {value: value}
    }

    self.on('include', function (event) {
      var value = self.get('newInclude')
      query.params.includes.push(Keyword(value))

      if (query.id) updateQuery(query, addDone)
      else queries.post(query, addDone)

      event.original.preventDefault()
    })

    function addDone (err, resp, body) {
      if (err) console.error(err)
      self.set('newInclude', null)
    }

    function pingTweets () {
      var query = self.get('query')
      queries.call('GET', query.id + '/tweets?filter[order]=id%20desc', function (err, resp, data) {
        if (err) return console.error(err)
        console.log(data.length)
        self.set('query.tweets', data)
        if (query.running) setTimeout(pingTweets, 2000)
      })
    }

    pingTweets()

    self.on('delete', function (event, id) {
      query.params.includes = query.params.includes.filter(function (thing) { return thing.value !== id })
      updateQuery(query)
      event.original.preventDefault()
    })

    self.on('start', function (event, id) {
      event.original.preventDefault()
      query.running = true
      updateQuery(query, function (err) {
        if (err) return
        pingTweets()
      })
    })

    self.on('stop', function (event, id) {
      event.original.preventDefault()
      query.running = false
      updateQuery(query)
    })

    function updateQuery (query, cb) {
      queries.put(query, function (err, resp, data) {
        if (err) return console.error(err)
        self.set('query', query)
        if (cb) cb(err, resp, data)
      })
    }
  }
}
