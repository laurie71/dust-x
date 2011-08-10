var assert = require('assert')
  // , expresso = require('expresso')
  , dustx = require('dust-x')
  
module.exports = {
    'test 1': function(end) {
        assert.ok(true, 'pre-test')
        
        end(function() {
            assert.ok(false, 'post-test')
        })
    }
}
