/**
 * Module dependencies.
 */

var express = require('express')
  , dustx = require('../dust-x')

/**
 * Create the Express application.
 */
var app = module.exports = express.createServer()

/** 
 * Configure Express
 */
app.configure(function() {
    app.set('views', __dirname + '/views')
    app.register('.dust', dustx/*({})*/)
    app.set('view engine', 'dust')
    app.use(app.router)
})

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })) 
})

app.configure('production', function() {
    app.use(express.errorHandler()) 
})

// Routes

app.get('/:path(*)', function(req, res) {
    var path = req.param('path') || 'index'
    res.render(path, { title: 'Express + Dust' })
})

// Only listen on $ node app.js

app.on('listening', function() {
    console.log("Express server listening on port %d", app.address().port)
})

app.listen(3000)
