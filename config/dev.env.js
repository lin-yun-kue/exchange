'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  signalR: '"http://uat.gib4u.com:5263/"',
  apiURL: '"http://uat.gib4u.com:10001"'
})
