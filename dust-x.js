// dust.js -- Express integration for the DustJS template engine
//
// Based in part on express-dust by Dav Glass
// https://github.com/davglass/express-dust

var dust = require('dustjs-linkedin')
  , http = require('http')
  , View = require('express/lib/view.js')
  , res = http.ServerResponse.prototype
  , self = this;

// ------------------------------------------------------------------------

var DEBUG = false;

var debug = DEBUG
    ? console.error.bind(console, 'DUSTX DEBUG')
    : function() {};
    
var summary = function(str) {
    return str.split('\n')[0].slice(0, 50)+'...'
};

// ------------------------------------------------------------------------
    
// Save original dust object prior to method override.
_dust = dust;

var preset = {
  whitespace: true ,
  cache: true
};

self.options = function options ( settings ) {
  preset = settings || preset;
  return self;
};

dust.setWhitespace = function () {
  dust.optimizers.format = (!!preset.whitespace)
    ? function(context, node) { return node; }
    : _dust.optimizers.format;
};


// Make Dust use Express to load templates for partials.
// This is used when a Dust template references another template, e.g. with:
// {<template}
dust.onLoad = function onLoad(name, context, callback) {
    debug('onLoad', name);

    dust.setWhitespace();

    // var v = view.lookup(name, context.stack.head)
    var v = View.lookup(name, context.stack.head);
    
    debug('onLoad ->', summary(v.contents));
    callback(null, v.contents);
};

// Monkey-patch Dust's load function to pass context through to onLoad.
// Needed so dust.onLoad() can pass the required settings and options
// to Express for template loading.
dust.load = function(name, chunk, context) {
  debug('load', name);
  var tmpl = dust.cache[name];
  if (tmpl) {
    return tmpl(chunk, context);
  } else {
    if (dust.onLoad) {
      return chunk.map(function(chunk) {
        //dust.onLoad(name, function(err, src) {// PATCH:
        dust.onLoad(name, context, function(err, src) {
          if (err) {
              debug('ERROR:', 'onLoad callback', err);
              return chunk.setError(err);
          }
          if (!dust.cache[name]) dust.loadSource(dust.compile(src, name));
          dust.cache[name](chunk, context).end();
        });
      });
    }
    debug('ERROR: no onLoad defined');
    return chunk.setError(new Error("Template Not Found: " + name));
  }
};

// ------------------------------------------------------------------------

// The Express / Dust interface.
// Note: this is called by Express when rendering a view/partial, but is
// *not* called by Dust for partials referenced by Dust's built-in syntax.
this.compile = function(str, opts) {
    var name = opts.filename;
    debug('compile', name, '\n\t', summary(str));

    if ( !!!preset.cache ) {
      dust.cache = {};
    }
    
    dust.loadSource(dust.compile(str, name));
    
    return function render(opts) {
        debug('render', name);
        var _dust = opts._dust
          , res = _dust.res
          , next = _dust.next
          , layout = _dust.layout
          , partial = _dust.partial
          , callback = _dust.callback;

        dust.render(name, opts, function onrender(err, html) {
            debug('onrender', name, '->', summary(html));
            if (err) return next(err);

            // async version of tail end of res._render logic:
            if (layout) {
                opts.isLayout = true;
                opts.layout = false;
                opts.body = html;
                this.render(layout, options, callback, view, true); // fixme ??? needs testing
            } else if (partial) {
                callback(null, html); // fixme is this the right thing to do here?
            } else if (callback) {
                callback(null, html);
            } else {
                res.send(html);
            }
        });
    };
};

// We need to monkey-patch Express's _render, too, so we can access the
// request, response and next() function from this.compile() and prevent
// Express from res.send()'ing the result of the template function, which
// we need to do asyncronously.
var _render = res.render
  , _onerror = function(e) { if (e) throw(e); };

res.render = function render(xview, context, fn, parent, sub) {
    // context is opts when looking in express.

    if (typeof(options) == 'function') {
        fn = context;
        context = null;
    }
    
    // pass additional context we'll need in compile/render/load. we need
    // to store opts.layout and opts.isPartial and set both to false to
    // prevent Express from handling those syncronously, then handle them
    // during render

    context = context || {};
    var = settings = context._dust = context._dust || {};

    settings.caching = settings.cache || true;
    settings.whitespace = settings.whitespace || true;

    settings.res = this;
    settings.req = this.req;
    settings.next = this.req.next;
    settings.callback = fn;

    settings.layout = context.layout;
    context.layout = false;

    settings.isPartial = context.isPartial;
    context.isPartial = false;
    
    // call default render, passing a no-op callbackto prevent Express from 
    // calling res.send() 
    _render.call(this, xview, context, _onerror, parent, sub);
};

