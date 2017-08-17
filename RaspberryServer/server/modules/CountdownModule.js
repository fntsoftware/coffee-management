/**************************************
* Module which start a countdown 
*
**************************************/
module.exports = function () {
    console.log("<Server> Countdown module loaded!");
    
    var simplebus = require('simplebus');
    var client = simplebus.createClient(8181);

	/////////////////////////////// Client messages /////////////////////////////////////////
    const POT_READY_NOTIFICATION_EVENT = 'potReadyNotification';
	const DATABASE_UPDATE_NOTIFICATION_EVENT = 'databaseUpdateNotification';
    const START_COUNTDOWN_EVENT = 'startCountdown';
	const POT_UPDATE_NOTIFICATON_EVENT = 'potUpdateNotification';
	/////////////////////////////////////////////////////////////////////////////////////////////
    
    /* Timer function */
    function startTimer(duration, potId) {
        var timer = duration, minutes, seconds;
        var intervalId = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            /* Display timeout */
            console.log(minutes + ":" + seconds);
			
			/* Sends a client post every 120 seconds to update the progress bar (every quarter)*/
			switch (timer) {
				case 480:
					client.post({ type: POT_UPDATE_NOTIFICATON_EVENT, timeId: 0, potId: potId });
					break;
				case 360:
					client.post({ type: POT_UPDATE_NOTIFICATON_EVENT, timeId: 120, potId: potId });
					break;
				case 240:
					client.post({ type: POT_UPDATE_NOTIFICATON_EVENT, timeId: 240, potId: potId });
					break;
				case 120:
					client.post({ type: POT_UPDATE_NOTIFICATON_EVENT, timeId: 360, potId: potId });
					break;
				case 0:
					client.post({ type: POT_UPDATE_NOTIFICATON_EVENT, timeId: 480, potId: potId });
					break;
				default:
					break;
			}

            if (--timer < 0) {
                console.log("Coffee pot is ready!");
                client.post({ type: POT_READY_NOTIFICATION_EVENT, potId: potId });
                clearInterval(intervalId);
            }
        }, 1000);
    }
  
    /* Events */
    client.start(function(){
    	console.log("<CoundownModule> Client started!");
    	client.subscribe({ type: START_COUNTDOWN_EVENT }, function(msg) 
		{ 
        	console.log("<CountDownModule> Start countdown!");
        	startTimer(msg.time, msg.potId);
			client.post({ type: DATABASE_UPDATE_NOTIFICATION_EVENT, buildingId: msg.buildingId, potId: msg.potId });
    	});
    });
};
