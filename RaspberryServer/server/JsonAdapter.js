var simplebus = require('simplebus');
var client = simplebus.createClient(8181);
client.start();

/* Load json adapter */
var JsonAdapter = require("./adapter/JsonAdapter");
var json = new JsonAdapter(client);
