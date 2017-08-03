/**************************************
* Module for notifying browser plugins 
*
**************************************/
module.exports = function () {
    console.log("<Server> Browser extension notification module loaded!"); 
    
	//////////////////////////////////// Client messages ///// //////////////////////////////////////
	const INCOMMING_POT_NOTIFICATION_EVENT = 'incommingPotNotification';
	const POT_READY_NOTIFICATION_EVENT = 'potReadyNotification';
	const POT_UPDATE_NOTIFICATON_EVENT = 'potUpdateNotification';
	const CONTROL_COFFEE_NOTIFICATION_EVENT = 'controlCoffeeNotification';
	const INFORM_USER_NOTIFICATION_EVENT = 'informUserNotification';
	const CONNECTED_NOTIFICATION_EVENT = 'userConnectedNotification';
	
	const INCOMMING_POT_EVENT = 'incommingPot';
	const POT_READY_EVENT = 'potReady';
	const POT_UPDATE_EVENT = 'potUpdate';
	const CONTROL_COFFEE_EVENT = 'controlCoffee';
	const INFORM_USER_EVENT = 'informUser';
	const CONNECTED_EVENT = 'userConnected';
	//////////////////////////////////////////////////////////////////////////////////////////////////
	var simplebus = require('simplebus');
	var client = simplebus.createClient(8181);
  
	var WebSocketServer = require("websocketserver");
	var server = new WebSocketServer("all", 9050);
	
    server.on("connection", function(id) {
		client.post({ type: CONNECTED_NOTIFICATION_EVENT, connection: true });
        console.log("User connected id: "+ id);
    });
    
    server.on("closedconnection", function(id) {
        console.log("Connection " + id + " has left the server");
    });
    
    /* Events */  
    client.start(function(){
		console.log("<BrowserNotificationModule> Client started!");
		
		// Notificaton for an incoming pot
    	client.subscribe({ type: INCOMMING_POT_NOTIFICATION_EVENT }, function(msg) { 
        	server.sendMessage("all", JSON.stringify({type: INCOMMING_POT_EVENT, potId: msg.potId}));
    	});
		
		// Notification to notify that the pot is filled
    	client.subscribe({ type: POT_READY_NOTIFICATION_EVENT }, function(msg) { 
       	 	server.sendMessage("all", JSON.stringify({type: POT_READY_EVENT, potId: msg.potId}));
    	});
	
		// Notificaton to notify about the progress status of the pot
		client.subscribe({ type: POT_UPDATE_NOTIFICATON_EVENT }, function(msg) { 
       	 	server.sendMessage("all", JSON.stringify({type: POT_UPDATE_EVENT, timeId: msg.timeId, potId: msg.potId }));
    	});
		
		// Notificaton to controll if the pot is taken
		client.subscribe({ type: CONTROL_COFFEE_NOTIFICATION_EVENT }, function(msg) { 
       	 	server.sendMessage("all", JSON.stringify({type: CONTROL_COFFEE_EVENT, control: msg.control, building: msg.building, floor: msg.floor, name: msg.name }));
    	});
		
		// Notificaton to inform the user about happend events
		client.subscribe({ type: INFORM_USER_NOTIFICATION_EVENT }, function(msg) { 
       	 	server.sendMessage("all", JSON.stringify({type: INFORM_USER_EVENT, building: msg.building, floor: msg.floor }));
    	});
		
		// Notificaton for the connection
		client.subscribe({ type: CONNECTED_NOTIFICATION_EVENT }, function(msg) { 
       	 	server.sendMessage("all", JSON.stringify({type: CONNECTED_EVENT, connection: msg.connected }));
    	});
	
	
    }); // Event Handler
}; // Module
