var simplebus = require('simplebus');
var bus = simplebus.createBus();
var server = simplebus.createServer(bus, 8181);
server.start();
