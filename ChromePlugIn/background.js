// If user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;

/////////////////////////////////////////////// Attributes and Events //////////////////////////////////////////////////////// 
var INCOMMING_POT_EVENT = "incommingPot", POT_READY_EVENT = "potReady", POT_UPDATE_EVENT = "potUpdate", CONTROL_COFFEE_EVENT = 'controlCoffee', readyNotification = "ready-notification", INFORM_USER_EVENT = 'informUser', CONNECTED_EVENT = 'userConnected';
var sockets = [], connection, connectedToServer = false, connectedToServer = false; // Variables for the websocket connection
var statusControl = '', notificationCtr = '', timeDisplayed = 0, progTimer = 0, icon = "icons/ready/ready48b.png", iconTimer = 0, stoppTime = 0, displayBar = true;// Spesific variables
var buildNr = 0, potNr = 0, usrName = ''; // User information
//////////////////////////////////////////////// Functions //////////////////////////////////////////////////////////////////
// Initial connect
tryConnect();

/**
 * Try to connect to websocket
 */
function tryConnect() {
	// Get the selected ip and port
    var ipAddr = localStorage.getItem("ipAddress");
    var port = localStorage.getItem("port");

	if(ipAddr && port) 
	{
		// Establish a connection
		removeAllClients();
		var WS_URL = 'ws://' + ipAddr + ':' + port;
		connection = new WebSocket(WS_URL);
		console.log("Connection: " + connection);
		console.log("TRY CONNECT TO: ", WS_URL);

		sockets.push(connection);
		connection.onopen = function(evt) { onOpen(evt) };
		connection.onmessage = function(evt) { onMessage(evt) };
		connection.onerror = function(evt) { onError(evt) };
		connection.onclose = function(evt) { onClose(evt) };
	}
	else {
		console.error("IP OR PORT NOT SPECIFIED!");
		chrome.browserAction.setIcon({path : { "19": "icons/notConnected/notConnected19b.png" }});
	}
}

/**
 * On open 
 */
function onOpen() {
	console.log("CONNECTED TO RASPBERRY SERVER");	
	chrome.browserAction.setIcon({path : { "19": "icons/notConnected/notConnected19b.png" }});
};

/**
 * On Error 
 */
function onError(error) {
    console.log("Server not available");
    connectedToServer = false;
    chrome.browserAction.setIcon({path : { "19": "icons/notConnected/notConnected19b.png" }});
	chrome.runtime.sendMessage({Disconnected: true}, function(response) { });
};

/**
 * On Message 
 */
function onMessage(message) 
{
    // Try to decode json (I assume that each message from server is json)
    try 
	{
        var json = JSON.parse(message.data);
    }
	catch (e) {
        console.log('<Server> This doesn\'t look like a valid JSON: ', message.data);
        return;
    }
	
	//////////////////// Get the data from the local storage and check them ///////////////////////////
	// Some basic attributes
	var myNotificationID = null; // necessary to determine which button was pressed		
	// Get the options, if they didnt exist set them to default values
	chrome.storage.sync.get(
	{
		notificationEnabled: 'Ja',
		notificationTrackEnabled: 'Ja',
		timeDisplayed: 0
	}, function(items)  {
		var temp = items.notificationTrackEnabled;
		localStorage.setItem("settingsBar", temp);
		temp = items.notificationEnabled;
		localStorage.setItem("settingsNotification", temp);
		temp = items.timeDisplayed;
		localStorage.setItem("settingsTimeDisplayed", temp);
	});

	var temp = localStorage.getItem("settingsBar");
	temp = temp.toUpperCase();
	if(temp.indexOf("JA") >= 0 || temp.indexOf("NEIN") >= 0)
	{
		statusControl = temp;
	}
	else { statusControl = "JA"; }

	var temp = localStorage.getItem("settingsNotification");
	temp = temp.toUpperCase();
	if(temp.indexOf("JA") >= 0 || temp.indexOf("NEIN") >= 0)
	{
		notificationCtr = temp;
	}
	else { notificationCtr = "JA"; }

	var temp = localStorage.getItem("settingsTimeDisplayed");
	temp = parseInt(temp);
	if(temp >= 0 && temp <= 20)
	{
		timeDisplayed = temp;
	}
	else { timeDisplayed = 0; }
	// Get the username {sets the username to "defaultUser" if no username is in local storage}
	usrName = localStorage.getItem("usrName"); 
	if( usrName && usrName !== "" && typeof usrName === 'string' ) {}
	else {
		// In case that the username is not selected set to default user
		var name = "defaultUser";
		localStorage.setItem("usrName", name);
	}

	// Get the building {set the building to "notSelected" if no building is in local storage}
	buildNr = localStorage.getItem("buildNr");
	if( buildNr && buildNr > 0 && buildNr < 10 ) {}
	else {
		// In case that the building is not selected set to "notSelected"
		var building = "notSelected";
		localStorage.setItem("buildNr", building);
	}
	
	// Get the pot {set the pot to "notSelected" if no pot is in local storage}
	potNr = localStorage.getItem("potNr");
	if( potNr && potNr > 0 && potNr < 10 ) {}
	else {
		// In case that the building is not selected set to "notSelected"
		var pot = "notSelected";
		localStorage.setItem("potNr", pot);
	}
	console.log("Connection status: ", connectedToServer);
	///////////////////////////////// Different messages for the user ///////////////////////////////////////////////////////////////
    if(json.type == INCOMMING_POT_EVENT && json.potId == potNr && notificationCtr == "JA")
    {
	////////////////////////////////// Pot is filled ////////////////////////////////////////////////////////////////////////////////
        chrome.browserAction.setIcon({path : {
            "19": "icons/empty/empty19.png",
            "38": "icons/empty/empty38.png"
        }});

        chrome.notifications.create('incommingPot', {
            type: 'basic',
            iconUrl: 'icons/notify/coffee-icon.png',
            title: 'Kanne ' + potNr + ' aus Stockwerk ' + buildNr  + ' wird befüllt!',
            message: 'In Geb\u00e4ude ' + buildNr + ' wird die Kanne ' + potNr + ' momentan befüllt.'
        }, function(notificationId) {});
    }
    else if(json.type == POT_READY_EVENT && json.potId == potNr && notificationCtr == "JA")
    {
	///////////////////////////////// Pot Ready Notification ///////////////////////////////////////////////////////////////////////
		// Change the icons of the plug-in
		chrome.browserAction.setIcon({path : {
			"19": "icons/ready/ready19b.png",
			"38": "icons/ready/ready38b.png"
		}});

		switch(timeDisplayed) {
			case 3:
			case 4:
			case 5:
				showNotification(buildNr, potNr, timeDisplayed);
				break;
			case 0:
			default:
				showInteractionNotification(buildNr, potNr);
				break;
		}
	
		displayBar = true;
		replyBtnClick(this.notifId, this.btnIdx); 
    }
	else if(json.type == POT_UPDATE_EVENT && json.potId == potNr && statusControl == "JA" && notificationCtr == "JA")
    {
	///////////////////////// Displays a progress bar and changes the plug-in icon /////////////////////////////////////////////////
		var timer = 0, crtTimer = 0;
		progTimer = 0, stoppTime = 0;
		if(displayBar == true)
		{
			switch(json.timeId) {
				case 0:   timer = 0; progTimer = 0; crtTimer = 0; break;
				case 120: timer = 151; progTimer = 25; crtTimer = 0; break;
				case 240: timer = 301; progTimer = 50; crtTimer = 0; break;
				case 360: timer = 451; progTimer = 75; crtTimer = 0; break;
				case 480: timer = 600; progTimer= 100; crtTimer = 0; break;
				default: break;
			}
			// Protects against unwanted calls from the server
			this.statusControl = "pleaseWait";
			// Calls a function which changes the plug-in icon and the progress bar
			updateIconAndBar(timer, crtTimer)
		} else {
			switch(json.timeId) {
				case 0: timer = 0; break;
				case 120: timer = 121; break;
				case 240: timer = 241; break;
				case 360: timer = 361; break;
				case 480: timer = 480; break;
				default: break;
			}
			this.statusControl = "pleaseWait";
			updateIcon(timer);
		}
	}
	else if(json.type == POT_UPDATE_EVENT && json.potId == potNr && statusControl == "NEIN" && notificationCtr == "JA")
	{
	///////////////////////// Changes just the plug-in icon - Progress bar isnt displayed //////////////////////////////////////////
		var timer = 0;

		switch(json.timeId) {
			case 0: timer = 0; break;
			case 120: timer = 121; break;
			case 240: timer = 241; break;
			case 360: timer = 361; break;
			case 480: timer = 480; break;
			default: break;
		}
		// Protects against unwanted calls from the server
		this.statusControl = "pleaseWait";
		// Calls a function which changes the plug-in icon
		updateIcon(timer);
	}
	else if(json.type == CONNECTED_EVENT && connectedToServer == false) 
	{
		connectedToServer = true;
		chrome.runtime.sendMessage({Connected: true}, function(response) { });
		chrome.browserAction.setIcon({path : { "19": "icons/ready/ready19b.png" }});
	}

	if(json.type == INFORM_USER_EVENT && json.floor == potNr && notificationCtr == "JA") 
	{
	///////////////////////// Notification to inform that another user already picked up the coffee pot ////////////////////////////
		// creates a rich notification to notify the user that the pot ist already picked up
		var potTaken = {
			type: 'basic',
			title: 'Kaffeekanne wird bereits abgeholt!',
			message: 'Die Kaffeekanne wird bereits abgeholt.\nSie m\u00fcssen die Kaffeekanne NICHT abholen!',
			iconUrl: 'icons/notify/info.png',
		}
		
		chrome.notifications.create("CoffeePotNotCollected", potTaken, function (id) {
			console.log("Another user already picked up the coffe pot!");
			myNotificationID = id;
		});

	}
	else if(json.type == CONTROL_COFFEE_EVENT && json.control == false && notificationCtr == "JA")
	{
	///////////////////////// Notification to inform that a user has agreed to pick up coffee pot //////////////////////////////////
		console.log("Server message: " + json.control + " " + json.building + " " + json.floor + " " + json.name);
		// creates a rich notification just to notify the user
		var getPot = {
			type: 'basic',
			title: 'Kaffeekanne wird abgeholt!',
			message: json.name + ' hat sich bereiterkl\u00e4rt, die Kaffeekanne\nin Geb\u00e4ude ' + buildNr + ' f\u00fcr das ' + potNr + '. Stockwerk abzuholen!',
			iconUrl: 'icons/notify/coffee-icon.png',	
		}

		chrome.notifications.create("CoffeePotCollected", getPot, function (id) {
			console.log("A user has agreed to pick up the coffee pot!");
			myNotificationID = id;
		});

	}
};

/**
 * On Close change the icon 
 */
function onClose(evt)
{
	console.log("DISCONNECTED");
	connectedToServer = false;
	chrome.browserAction.setIcon({path : { "19": "icons/notConnected/notConnected19b.png" }});
	chrome.runtime.sendMessage({Disconnected: true}, function(response) { });
}

/**
 * Listen to events sent by popup.js
 */
chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
  if (msg.tryConnect) {
    tryConnect();
  }
  if (msg.progBar) {
	 progBar();
  }
  if (msg.refill) {
	  refill();
  }
});

chrome.browserAction.onClicked.addListener(()=> {
  var clearing = browser.notifications.clear(cakeNotification);
  clearing.then(() => {
    console.log("cleared");
  });
});

// Action listener which controlls the button click through an button id
chrome.notifications.onButtonClicked.addListener(replyBtnClick);
// Action listener which controlls the exit
chrome.notifications.onClosed.addListener(function callback(notificationId, byUser) {
	if(byUser == true)
	{
		clearInterval(iconTimer);
		displayBar = false;
		updateIcon(stoppTime);
	}
});

////////////////////////////////////// Outsourced source code for the overview /////////////////////////////////////////////////////
// Responds to the button click
function replyBtnClick(notifId, btnIdx) {	
	if(btnIdx == 0) // Queries the buttons
	{
		chrome.notifications.clear("potReady"); // Cleares the query notification

		///////////////////////////////////// Send message to server with data for the database /////////////////////////////////
		// Get the selected ip and port
		var ipAddr = localStorage.getItem("ipAddress");
		var port = localStorage.getItem("port");

		if(ipAddr && port) 
		{
			// Connects to server
			var WS_URL = 'ws://' + ipAddr + ':' + port;
			var connection = new WebSocket(WS_URL);
		
			// Checks every second if the server is ready to send messages and if he is he sends the message
			var myTimer = setInterval(function()
			{ 
				if (connection.readyState === 1) 
				{
					// Short delay between two consecutive actions because the raspberry have to edit functions
					clearInterval(myTimer);
					var msg = "true," + usrName + "," + buildNr + "," + potNr;
					connection.send(msg); // Here you inform the others who have picked the pot
					console.log("<Client-Message1>: " + msg);
					setTimeout(function() { 
						var msg = "" + usrName + "," + buildNr + "," + potNr;
						console.log("<Client-Message2>: " + msg + " has been sent to the server!");
						connection.send(msg); // Here send your data in format: name,building,floor {like csv}
						console.log("<Client> Client to server message could be sent successfully!");
					}, 5000);
					
					setTimeout(function() { 
						connection.close();
					}, 10000);
				}
				else {
					console.log("Connection is still being build!");
				}	
			}, 1000);	 
		}
		////////////////////////////////////////////// Message send to server ///////////////////////////////////////////////////
	} else if(btnIdx === 1)
	{
		chrome.notifications.clear("potReady");
		chrome.notifications.clear("potProgStatus");
		chrome.notifications.clear("potProgReady");
	}
}
// Removes all existing connections
function removeAllClients(){
	if(sockets.length > 0)
	{
		this.sockets.forEach(function(s) 
		{
			console.log("Closed the websocket connection!");
			s.close();
		});
	} else {
		console.log("No existing connections!");
	}
}
// Updates the plug-in icon without the progress bar
function updateIcon(timer) {
	// Variables to change the plug-in icon
	var iconCount0  = 1;
	var iconCount25 = 1;
	var iconCount50 = 1;
	var iconCount75 = 1;
	var time = timer;

	// Animates the Plug-In Icon every time intervall until a certain demolition event happens
	var iconTimer = setInterval(function()
	{ 
		switch(true) {
			case (time >= 0  && time < 120) && (iconCount0 == 1):
				iconCount0 = setIcon(0, 0); break;
			case (time >= 0  && time < 120) && (iconCount0 == 2):
				iconCount0 = setIcon(0, 1); break;
			case (time >= 0  && time < 120) && (iconCount0 == 3):
				iconCount0 = setIcon(0, 2); break;
			case (time >= 0  && time < 120) && (iconCount0 == 4):
				iconCount0 = setIcon(0, 3); break;
			case (time > 120 && time < 240) && (iconCount25 == 1):
				iconCount25 = setIcon(25, 0); break;
			case (time > 120 && time < 240) && (iconCount25 == 2):
				iconCount25 = setIcon(25, 1); break;
			case (time > 120 && time < 240) && (iconCount25 == 3):
				iconCount25 = setIcon(25, 2); break;
			case (time > 120 && time < 240) && (iconCount25 == 4):
				iconCount25 = setIcon(25, 3); break;
			case (time > 240 && time < 360) && (iconCount50 == 1):
				iconCount50 = setIcon(50, 0); break;
			case (time > 240 && time < 360) && (iconCount50 == 2):
				iconCount50 = setIcon(50, 1); break;
			case (time > 240 && time < 360) && (iconCount50 == 3):
				iconCount50 = setIcon(50, 2); break;
			case (time > 240 && time < 360) && (iconCount50 == 4):
				iconCount50 = setIcon(50, 3); break;
			case (time > 75 && time < 480) && (iconCount75 == 1):
				iconCount75 = setIcon(75, 0); break;
			case (time > 75 && time < 480) && (iconCount75 == 2):
				iconCount75 = setIcon(75, 1); break;
			case (time > 75 && time < 480) && (iconCount75 == 3):
				iconCount75 = setIcon(75, 2); break;
			case (time > 75 && time < 480) && (iconCount75 == 4):
				iconCount75 = setIcon(75, 3); break;
			case (time == 120 || time == 240 || time == 360 || time >= 480):
				clearInterval(iconTimer);
				this.statusControl = "NEIN";
				break;
			default:
				chrome.browserAction.setIcon({path : { "38": "icons/iconChange/full.png" }});
				console.log("Failed to receive the interval time or couldnt load plug-in icon!");
				break;
		}
		time++; // Time counts largely independent of server time -> controls the time just on certain events
	}, 1000); // End of intervall { refreshes the plug-in icon every 800 ms in order to count excatly to 4.8 seconds }
}
// Sets the icon of the browser plug-in
function setIcon(index1, index2) {
	// tpyeNumber consists of: status number {0, 25, 50 ...} and current status of the icon {0, 1, 2 ...} in format number1.number2
	var typeNumber = index1 + "." + index2;
	var path = "icons/iconChange/empty" + typeNumber + ".png";

	chrome.browserAction.setIcon({path : {
		"38": path
	}});

	switch(index2) {
		case 0:	return 2;
		case 1: return 3;
		case 2: return 4;
		case 3: return 1;
	}
}
// Updates the plug-in icon and the progress bar
function updateIconAndBar(timer, crtTimer) {
	// Variables to change the plug-in icon
	var iconCount0  = 1;
	var iconCount25 = 1;
	var iconCount50 = 1;
	var iconCount75 = 1;

	// Animates the Plug-In Icon every time intervall until a certain demolition event happens
	iconTimer = setInterval(function()
	{ 
		if (crtTimer == 6)
		{
			progTimer++;
			crtTimer = 0;
		}

		chrome.notifications.clear("msj");

		switch(true) {
			case (timer >= 0  && timer < 150) && (iconCount0 == 1):
				var msj = setProgressBar(0); iconCount0 = setIcon(0, 0); break;
			case (timer >= 0  && timer < 150) && (iconCount0 == 2):
				var msj = setProgressBar(0); iconCount0 = setIcon(0, 1); break;
			case (timer >= 0  && timer < 150) && (iconCount0 == 3):
				var msj = setProgressBar(0); iconCount0 = setIcon(0, 2); break;
			case (timer >= 0  && timer < 150) && (iconCount0 == 4):
				var msj = setProgressBar(0); iconCount0 = setIcon(0, 3); break;
			case (timer > 150 && timer < 300) && (iconCount25 == 1):
				var msj = setProgressBar(25); iconCount25 = setIcon(25, 0); break;
			case (timer > 150 && timer < 300) && (iconCount25 == 2):
				var msj = setProgressBar(25); iconCount25 = setIcon(25, 1);	break;
			case (timer > 150 && timer < 300) && (iconCount25 == 3):
				var msj = setProgressBar(25); iconCount25 = setIcon(25, 2);	break;
			case (timer > 150 && timer < 300) && (iconCount25 == 4):
				var msj = setProgressBar(25); iconCount25 = setIcon(25, 3); break;
			case (timer > 300 && timer < 450) && (iconCount50 == 1):
				var msj = setProgressBar(50); iconCount50 = setIcon(50, 0);	break;
			case (timer > 300 && timer < 450) && (iconCount50 == 2):
				var msj = setProgressBar(50); iconCount50 = setIcon(50, 1);	break;
			case (timer > 300 && timer < 450) && (iconCount50 == 3):
				var msj = setProgressBar(50); iconCount50 = setIcon(50, 2);	break;
			case (timer > 300 && timer < 450) && (iconCount50 == 4):
				var msj = setProgressBar(50); iconCount50 = setIcon(50, 3); break;
			case (timer > 450 && timer < 600) && (iconCount75 == 1):
				var msj = setProgressBar(75); iconCount75 = setIcon(75, 0); break;
			case (timer > 450 && timer < 600) && (iconCount75 == 2):
				var msj = setProgressBar(75); iconCount75 = setIcon(75, 1); break;
			case (timer > 450 && timer < 600) && (iconCount75 == 3):;
				var msj = setProgressBar(75); iconCount75 = setIcon(75, 2); break;
			case (timer > 450 && timer < 600) && (iconCount75 == 4):
				var msj = setProgressBar(75); iconCount75 = setIcon(75, 3);	break;
			case (timer >= 600):
				clearInterval(iconTimer);	
				chrome.notifications.clear("potProgStatus");
				this.statusControl = "JA";
				setTimeout(function() {
					// Creates a notification to notify that the 100% are reached
					var success = {
						type: "image",
						title: "Kaffee fertig!",
						message: "Die Kaffeekanne aus \nGeb\u00e4ude " + buildNr + " Stockwerk " + potNr + " wurde zubereitet!",
						iconUrl: "icons/progBar/coffee-icon.png",
						imageUrl: "icons/progBar/coffee-beans.png",
					}
					
					var notReady = chrome.notifications.create("potProgReady", success, function (id) {
						console.log("<ProgressBar> The coffee pot from building " + buildNr + " floor " + potNr + " was successfully tracked!");
						myNotificationID = id;
					});
				}, 1500);
				setTimeout(function() { chrome.notifications.clear("potProgReady"); }, 3000);
				break;
			case (timer == 150 || timer == 300 || timer == 450):
				clearInterval(iconTimer);	
				this.statusControl = "JA";
				break;
			default:
				chrome.browserAction.setIcon({path : { "38": "icons/iconChange/full.png" }});
				console.log("Failed interval time received or couldnt load plug-in icon!");
				break;
		}
		crtTimer++;
		stoppTime++;
		timer++; // Time counts largely independent of server time -> controls the time just on certain events
	}, 800); // End of intervall { refreshes the plug-in icon every second }
}
// Sets the icon of the browser plug-in and the progress bar
function setProgressBar(index) {
	// Creates a new notification with the refreshed time
	var track = {
		type: "progress",
		title: "Kaffeekannenstatus",
		message: "Die Kaffeekanne aus Geb\u00e4ude " + buildNr + " Stockwerk " + potNr + " ist zu " + progTimer + "% fertig zubereitet!",
		iconUrl: icon,
		progress: progTimer,
	}

	switch(index) {
		case 0: icon = "icons/progBar/progBar-empty.png"; break;
		case 25: icon = "icons/progBar/progBar-empty25.png"; break;
		case 50: icon = "icons/progBar/progBar-empty50.png"; break;
		case 75: icon = "icons/progBar/progBar-empty75.png"; break;
	}
	
	return chrome.notifications.create("potProgStatus", track, function (id) { myNotificationID = id; });
}
// Displays a notification that the coffee pot can be picked up -> notification lasts for ever
function showInteractionNotification(building, floor) {
	console.log("Notification requires Interactions!");
	var notificationCoffee = {
		type: 'basic',
		iconUrl: 'icons/notify/coffee-icon.png',
		title: 'Kaffeekanne ist fertig!',
		message: 'Die Kaffeekanne in Geb\u00e4ude ' +  building + ' \nim ' + floor + '. Stockwerk ist fertig!\nWollen Sie die Kaffeekanne abholen?',
		requireInteraction: true,
		buttons: [
		{ 
			title: 'Ja',
			iconUrl: 'icons/notify/yes_button.png'
		},
		{
			title: "Ignorieren",
			iconUrl: 'icons/notify/no_button.png'
		}],
		isClickable:true,
	};
	chrome.notifications.create("potReady", notificationCoffee, function (id) {
		console.log("Coffee pot is ready to be picked up!");
		myNotificationID = id;
	});
}
// Displays a notification that the coffee pot can be picked up -> notification only lasts a certain time
function showNotification(building, floor, time) {
	console.log("Notification last for " + time + " seconds!");
	var showNotifyId = 1;
	var showNotify = setInterval(function()
	{ 
		showNotifyId++;
		if(showNotifyId >= time)
		{
			clearInterval(showNotify);
			chrome.notifications.clear("notificationCoffee");
		} else {
			var notificationCoffee = {
				type: 'basic',
				iconUrl: 'icons/notify/coffee-icon.png',
				title: 'Kaffeekanne ist fertig!',
				message: 'Die Kaffeekanne in Geb\u00e4ude ' +  building + ' \nim ' + floor + '. Stockwerk ist fertig!\nWollen Sie die Kaffeekanne abholen?',
				buttons: [
				{ 
					title: 'Ja',
					iconUrl: 'icons/notify/yes_button.png'
				},
				{
					title: "Ignorieren",
					iconUrl: 'icons/notify/no_button.png'
				}],
				isClickable:true,
			};
			chrome.notifications.create("potReady", notificationCoffee, function (id) {
				console.log("Coffee pot is ready to be picked up!");
				myNotificationID = id;
			});
		}
	}, 5000);
}
// Sends server message to refill the coffee pot
function refill() {
	// Here it sends a server-message
}