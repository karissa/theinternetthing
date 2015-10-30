var path = require('path')

var app = require(path.resolve(__dirname, '../server/server'))
var ds = app.datasources.postgresql

var lbTables = ['User', 'AccessToken', 'ACL', 'RoleMapping', 'Role', 'query', 'tweets']

ds.automigrate(lbTables, function (err) {
  if (err) throw err
  console.log('Looback tables [' + lbTables + '] created in ', ds.adapter.name)
  ds.disconnect()
})
