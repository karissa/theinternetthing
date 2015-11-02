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

    function Keyword (value) {
      return {value: value}
    }

    self.on('include', function (event) {
      var value = self.get('newInclude')
      query.params.includes.push(Keyword(value))
      self.set('newInclude', null)
      event.original.preventDefault()
    })

    self.on('exclude', function (event) {
      var value = self.get('newExclude')
      query.params.excludes.push(Keyword(value))
      self.set('newExclude', null)
      event.original.preventDefault()
    })

    function pingTweets () {
      var query = self.get('query')
      if (!query.running) return
      queries.call('GET', query.id + '/tweets?filter[order]=id%20desc', function (err, resp, data) {
        if (err) return console.error(err)
        self.set('tweets', data)
        setTimeout(pingTweets, 2000)
      })
    }

    pingTweets()

    self.on('done', function () {
      queries.post(query, function (err, resp, body) {
        if (err) console.error(err)
        done()
      })
    })

    self.on('stop', function (event, id) {
      queries.call('GET', 'stop?id=' + id, function (err, resp, data) {
        if (err) return console.error(err)
        query.running = false
      })
      event.original.preventDefault()
    })

    self.on('start', function (event, id) {
      queries.call('GET', 'start?id=' + id, function (err, resp, data) {
        if (err) return console.error(err)
        query.running = true
      })
      event.original.preventDefault()
    })


    function done () {
      window.location.href = '/'
    }
  }
}
