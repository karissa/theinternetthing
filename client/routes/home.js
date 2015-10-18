var fs = require('fs')
var path = require('path')
var queries = require('../models')('queries')
var xhr = require('xhr')

module.exports = {
  url: '/',
  template: fs.readFileSync(path.join(__dirname, '../templates/home.html')).toString(),
  onrender: function () {
    var self = this
    function all () {
      queries.all(function (err, resp, data) {
        self.set('queries', data)
      })
    }

    // get all queries
    all()

    self.on('delete', function (event, id) {
      console.log(arguments)
      queries.delete(id, function (err, resp, data) {
        if (err) return console.error(err)
        all()
      })
      event.original.preventDefault()
    })
  }
}
