module.exports = function (Query) {
  Query.stop = function (id, cb) {
    Query.updateAll({id: id}, {running: false}, function (err, info) {
      if (err) throw err
      return cb(null, info)
    })
  }

  Query.start = function (id, cb) {
    Query.findById(id, function (err, obj) {
      if (err) throw err
      obj.updateAttribute('running', true, function (err, obj) {
        if (err) throw err
        return cb(null, obj)
      })
    })
  }

  Query.remoteMethod('stop', {
    http: {path: '/stop', verb: 'get'},
    accepts: {arg: 'id', type: 'number', http: {source: 'query'}},
    returns: {arg: 'status', type: 'string'}
  })
  Query.remoteMethod('start', {
    http: {path: '/start', verb: 'get'},
    accepts: {arg: 'id', type: 'number', http: {source: 'query'}},
    returns: {arg: 'status', type: 'string'}
  })
  return Query
}
