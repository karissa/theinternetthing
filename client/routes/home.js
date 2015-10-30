var fs = require('fs')
var path = require('path')
var queries = require('../models')('queries')

module.exports = {
  url: '/',
  template: fs.readFileSync(path.join(__dirname, '../templates/home.html')).toString(),
  onrender: function () {
    var self = this
    function all () {
      queries.all(function (err, resp, data) {
        if (err) return console.error(err)
        self.set('queries', data)
      })
    }

    self.on('stop', function (event, id) {
      queries.call('GET', 'stop?id=' + id, function (err, resp, data) {
        if (err) return console.error(err)
        all()
      })
      event.original.preventDefault()
    })

    self.on('start', function (event, id) {
      queries.call('GET', 'start?id=' + id, function (err, resp, data) {
        if (err) return console.error(err)
        all()
      })
      event.original.preventDefault()
    })

    // get all queries
    all()

    self.on('delete', function (event, id) {
      queries.delete(id, function (err, resp, data) {
        if (err) return console.error(err)
        all()
      })
      event.original.preventDefault()
    })
  }
}
