var Queries = require('./index')('queries')

module.exports = Queries

Queries.prototype.trigger = function (id, route, cb) {
  var opts = {
    url: this.url + '/' + id + '/' + route,
    method: 'GET',
    json: true
  }

  xhr(opts, cb)
}
