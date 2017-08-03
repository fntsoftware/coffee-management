/**************************************
* Module which maps a id to a coffee
* pot
*
**************************************/
module.exports = function () {
    console.log("<Server> Mapping Module loaded!");

	//////////////////////////// Client messages /////////////////////////////////////////////
	const RESET_CONTROL_COFFEE_NOTIFICATION_EVENT = 'resetControlCoffeeNotification';
    const INCOMMING_POT_NOTIFICATION_EVENT = 'incommingPotNotification';
	const CONTROL_COFFEE_NOTIFICATION_EVENT = 'controlCoffeeNotification';
	const POT_READY_NOTIFICATION_EVENT = 'potReadyNotification';
    const START_COUNTDOWN_EVENT = 'startCountdown';
    const MAP_EVENT = 'map';
	/////////////////////////////////////////////////////////////////////////////////////////////
	
    var simplebus = require('simplebus');
    var client = simplebus.createClient(8181);
	var startedCountdowns = [];
	
    /* Map function */
    function mapper(tagId) {
        console.log("<MappingModule> Coffee pot with ID " + tagId + " was detected!");
        switch (tagId) {
            case '000002CA9159':
            case '82003CE1B5EA':
                console.log("<MappingModule> ID belogs to coffee pot 1!");
				if(startedCountdowns.indexOf(1) == -1) 
				{
					startedCountdowns.push(1);
					client.post({ type: RESET_CONTROL_COFFEE_NOTIFICATION_EVENT, building: 3, floor: 1 });
					client.post({ type: INCOMMING_POT_NOTIFICATION_EVENT, potId: 1 });
					client.post({ type: START_COUNTDOWN_EVENT, time: 480, potId: 1 }); // set countdown for 8 minutes
					client.post({ type: CONTROL_COFFEE_NOTIFICATION_EVENT, control: true, building: 3, floor: 1, name: '' });
				}
                break;
            case '000002B00BB9':
            case '82003CCCDCAE':
                console.log("<MappingModule> ID belongs to coffee pot 2!");
				if(startedCountdowns.indexOf(2) == -1) 
				{
					startedCountdowns.push(2);
					client.post({ type: RESET_CONTROL_COFFEE_NOTIFICATION_EVENT, building: 3, floor: 2 });
					client.post({ type: INCOMMING_POT_NOTIFICATION_EVENT, potId: 2 });
					client.post({ type: START_COUNTDOWN_EVENT, time: 480, potId: 2 });
					client.post({ type: CONTROL_COFFEE_NOTIFICATION_EVENT, control: true, building: 3, floor: 2, name: '' });
				}
                break;
            case '000002EC0BE5':
            case '000002E537D0':
                console.log("<Mapping Module> ID belongs to coffee pot 3!");
				if(startedCountdowns.indexOf(3) == -1) 
				{
					startedCountdowns.push(3);
					client.post({ type: RESET_CONTROL_COFFEE_NOTIFICATION_EVENT, building: 3, floor: 3 });
					client.post({ type: INCOMMING_POT_NOTIFICATION_EVENT, potId: 3 });
					client.post({ type: START_COUNTDOWN_EVENT, time: 480, potId: 3 });
					client.post({ type: CONTROL_COFFEE_NOTIFICATION_EVENT, control: true, building: 3, floor: 3, name: '' });
				}
                break;
            default:
                console.log("<MappingModule> Coffee pot is unknown or damaged!");
                break;
        }
    }

    /* Events */
    client.start(function(){
		
        console.log("<MappingModule> Client started!");
        client.subscribe({ type: MAP_EVENT }, function(msg) {
                mapper(msg.tagId);
        });
		
		// Notification to inform that the pot is filled
		client.subscribe({ type: POT_READY_NOTIFICATION_EVENT }, function(msg) 
		{ 
        	var index = startedCountdowns.indexOf(msg.potId);
			startedCountdowns.splice(index, 1);
    	});
	}); // End of Event
	
}; // End of Module
