var fs = require('fs')
var path = require('path')
var xhr = require('xhr')

module.exports = {
  url: '/',
  template: fs.readFileSync(path.join(__dirname, '../templates/home.html')).toString(),
  onrender: function () {
    var self = this
    function queries () {
      var opts = {
        method: 'GET',
        url: '/api/queries',
        json: true
      }
      xhr(opts, function (err, resp, data) {
        if (err) return console.error(err)
        self.set('queries', data)
      })
    }

    // get all queries
    queries()

    self.on('delete', function (event, id) {
      console.log(arguments)
      var opts = {
        method: 'DELETE',
        url: '/api/queries/' + id,
        json: true
      }
      xhr(opts, function (err, resp, data) {
        if (err) return console.error(err)
        queries()
      })
      event.original.preventDefault()
    })
  }
}
