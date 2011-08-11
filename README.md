Dust Templates for Express
==========================
`dust-x` integrates [Dust][1] templates into [Express][2].

Installation
------------
Since `dust-x` is still experimental, it's not published
to npm yet. To use it, clone the git repository into your
project directly:

    $ cd node_modules
    $ git clone git://github.com/laurie71/dust-x.git

Usage
-----
To use Dust templates in Express you need to register
`dust-x` as the template engine:

*app.js:*

    var express = require('express')
      , dustx = require('dust-x')
      , app = express.createServer()
    
    app.configure(function() {
        app.register('.dust', dustx)
        app.set('view engine', 'dust')
        ...
    })

You can then render Dust templates from your route
handlers as normal:

*app.js:*

    app.get('/', function(req, res) {
        res.render('index', { title: 'Express+Dust' })
    })

Compatibility
-------------
Dust uses an asynchronous API for template rendering, 
which Express unfortunately doesn't support yet. To
work around this, `dust-x` monkey-patches Express'
view rendering to work asynchronously, which will
break other rendering engines. You therefore can't
mix Dust templates with Jade, EJS or other templates.

Express applications typically only use a single
template engine, so this isn't normally a problem in 
practice. You do need to bear it in mind if you want
to migrate existing templates from another view engine
to Dust, though.


Support
-------
If you have problems getting `dust-x` to work in your
project, start by looking at the [example application][3].

If you're still stuck, or if you think you've found a
bug or limitation in `dust-x`, please [create an issue][4]
describing the problem. 

Alternatively, you can try asking on the Express users'
[mailing list][5]. Note, though, that `dust-x` isn't an
official component of Express.

License
-------
`dust-x` is distributed under the MIT license; see the
[LICENSE file][6] for details.

[1]: http://akdubya.github.com/dustjs/
[2]: http://expressjs.com/
[3]: ./example/
[4]: https://github.com/laurie71/dust-x/issues
[5]: http://groups.google.com/group/express-js
[6]: ./LICENSE.txt
