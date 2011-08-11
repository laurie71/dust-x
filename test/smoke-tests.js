var assert = require('assert')
  , app = require('../example/app')

module.exports = {
    'GET /': function() {
        assert.response(app,
            { url: '/' },
            { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' }},
            function(res) {
                assert.includes(res.body, '<title>Dust-X Demo</title>');
            }
        )
    }
}
