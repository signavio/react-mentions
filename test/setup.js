// init jsdom
var jsdom = require('jsdom').jsdom;
var doc = jsdom('<!doctype html><html><head><meta charset="utf-8"></head><body></body></html>');
var win = doc.defaultView;

// globalize some stuff
global.document = doc;
global.window = win;
win.console = global.console;
global.navigator = { userAgent: "Node.js"};
global.jQuery = require('jquery');
global.Blob = window.Blob;

// setup chai plugins
var chai = require('chai');
var chaiThings = require('chai-things');
var chaiEnzyme = require('chai-enzyme');
var sinonChai = require('sinon-chai');
chai.use(chaiThings);
chai.use(chaiEnzyme);
chai.use(sinonChai);

// export preconfigured chai
module.exports = chai;
