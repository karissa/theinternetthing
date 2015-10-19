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

var query = Query()

module.exports = {
  url: '/query/:id',
  data: function (params, cb) {
    var data = {query: query}
    if (params.id === 'new') return cb(data)
    queries.get(params.id, function (err, resp, body) {
      if (err) console.error(err)
      console.log(query)
      query = body
      cb({query: query})
    })
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

    self.set('sql', "select * from tweets where text match '*@theinternetthing'")

    self.on('done', function () {
      queries.post(query, function (err, resp, body) {
        if (err) console.error(err)
        done()
      })
    })

    function done () {
      window.location.href = '/'
    }
  }
}
