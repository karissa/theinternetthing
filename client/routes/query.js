var fs = require('fs')
var path = require('path')
var xhr = require('xhr')
var queries = require('../models')('queries')

var includes = []
var excludes = []

module.exports = {
  url: '/query/:id',
  data: function (params, cb) {
    var data = {
      includes: includes,
      excludes: excludes
    }
    if (params.id === 'new') return cb(data)
    queries.get(params.id, function (err, resp, query) {
      data.query = query
      cb(data)
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
      includes.push(Keyword(value))
      self.set('newInclude', null)
      event.original.preventDefault()
    })

    self.on('exclude', function (event) {
      var value = self.get('newExclude')
      excludes.push(Keyword(value))
      self.set('newExclude', null)
      event.original.preventDefault()
    })

    self.set('sql', "select * from tweets where text match '*@theinternetthing'")

    self.on('done', function () {
      var data = {
        params: {
          name: self.get('name'),
          includes: self.get('includes'),
          excludes: self.get('excludes')
        }
      }
      queries.post(data, function (err, resp, body) {
        if (err) console.error(err)
        self.set('includes', [])
        self.set('excludes', [])
      })
    })
  }
}
