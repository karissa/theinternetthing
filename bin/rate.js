module.exports = function rate (client, resources, cb) {
  client.get('application/rate_limit_status', {resources: resources}, cb)
}
