// If user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;

/////////////////////////////////////////////// Attributes and Events //////////////////////////////////////////////////////// 
var INCOMMING_POT_EVENT = "incommingPot", POT_READY_EVENT = "potReady", POT_UPDATE_EVENT = "potUpdate", CONTROL_COFFEE_EVENT = 'controlCoffee', INFORM_USER_EVENT = 'informUser', CONNECTED_EVENT = 'userConnected';
var sockets = [], connection, connectedToServer = false; // Variables for the websocket connection
var statusControl = 1, timeDisplayed = 0, progTimer = 0, iconTimer = 0, displayBar = true, stopTime = 0; // Variables to watch over the time
var buildNr = localStorage.getItem("buildNr"), floorNr = localStorage.getItem("floorNr"), usrName = localStorage.getItem("usrName"); // Get user information from local storage
var myNotificationID = null, notificationCtr = 1, icon = "icons/ready/ready48b.png"; // Variables for the notifications
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
		disconnectedStyle();
	}
}

/**
 * On open 
 */
function onOpen() {
	// Checks for the styling of the plug-in
	if(connectedToServer == false)
	{
		setTimeout(function(){ 
			if(connectedToServer == false) disconnectedStyle();	
		}, 3000);

	} else if(connectedToServer == true) {
		console.log("<RASPBERRY-SERVER> User connected to the server!");
	}
};

/**
 * On Error 
 */
function onError(error) {
    console.log("<ERROR> Server currently not available!");
    connectedToServer = false;
    disconnectedStyle();
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
        console.log('<SERVER> This doesn\'t look like a valid JSON: ', message.data);
        return;
    }
	
	// Load the plug-in option into the application
	loadOptions();
	buildNr = localStorage.getItem("buildNr"), floorNr = localStorage.getItem("floorNr"), usrName = localStorage.getItem("usrName");
	
	///////////////////////////////// Different messages for the user ///////////////////////////////////////////////////////////////
    if(json.type == INCOMMING_POT_EVENT && json.potId == floorNr && notificationCtr == 1)
    {
	////////////////////////////////// Pot is filled ////////////////////////////////////////////////////////////////////////////////
		console.log("<INCOMMING-POT> Coffee can has arrived and is brewing!");
        chrome.browserAction.setIcon({path : {
            "19": "icons/empty/empty19.png",
            "38": "icons/empty/empty38.png"
        }});

        chrome.notifications.create('incommingPot', {
            type: 'basic',
            iconUrl: 'icons/notify/coffee-icon.png',
            title: 'Kanne ' + floorNr + ' aus Stockwerk ' + buildNr  + ' wird befüllt!',
            message: 'In Geb\u00e4ude ' + buildNr + ' wird die Kanne ' + floorNr + ' momentan befüllt.'
		}, function(notificationId) {});
    }
    else if(json.type == POT_READY_EVENT && json.potId == floorNr && notificationCtr == 1)
    {
	///////////////////////////////// Pot Ready Notification ///////////////////////////////////////////////////////////////////////
		console.log("<POT-READY> Coffee can is ready!")
		// Change the icons of the plug-in
		chrome.browserAction.setIcon({path : { "19": "icons/ready/ready19b.png",	"38": "icons/ready/ready38b.png" }});

		// Determine notification display time
		switch(timeDisplayed) {
			case 3: case 4: case 5:
				showNotification(buildNr, floorNr, timeDisplayed); break;
			case 0: default:
				showInteractionNotification(buildNr, floorNr); break;
		}
		
		iconTimer = 0;
		clearInterval(iconTimer); // Stop timer
		displayBar = true; // Enables progressbar
		replyBtnClick(this.notifId, this.btnIdx); 
    }
	else if(json.type == POT_UPDATE_EVENT && json.potId == floorNr && statusControl == 1 && notificationCtr == 1)
    {
	///////////////////////// Displays a progress bar and changes the plug-in icon /////////////////////////////////////////////////
		var timer = 0, crtTimer = 0;
		progTimer = 0;
		
		if(displayBar == true)
		{
			clearInterval(iconTimer);
			console.log("<POT-UPDATE> Coffee pot update received and timer was stopped!");
			switch(json.timeId) {
				case 0:   timer = 0;   progTimer = 0;  crtTimer = 0; stopTime = 0;   break;
				case 120: timer = 151; progTimer = 25; crtTimer = 0; stopTime = 121; break;
				case 240: timer = 301; progTimer = 50; crtTimer = 0; stopTime = 241; break;
				case 360: timer = 451; progTimer = 75; crtTimer = 0; stopTime = 361; break;
				case 480: timer = 600; progTimer= 100; crtTimer = 0; stopTime = 480; break;
				default: break;
			}
			// Protects against unwanted calls from the server
			this.statusControl = 5;
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
			this.statusControl = 5;
			updateIcon(timer);
		}
	}
	else if(json.type == POT_UPDATE_EVENT && json.potId == floorNr && statusControl == 0 && notificationCtr == 1)
	{
	///////////////////////// Changes just the plug-in icon - Progress bar isnt displayed //////////////////////////////////////////
		console.log("<POT-UPDATE> Progressbar update arrived!");
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
		this.statusControl = 5;
		// Calls a function which changes the plug-in icon
		updateIcon(timer);
	}
	else if(json.type == CONNECTED_EVENT && connectedToServer == false) 
	{       
		connectedToServer = true;
		connectedStyle();
	}

	if(json.type == INFORM_USER_EVENT && json.floor == floorNr && notificationCtr == 1) 
	{
	///////////////////////// Notification to inform that another user already picked up the coffee pot ////////////////////////////
		console.log("<INFORM-USER> Coffee can already taken!");
		var potTaken = {
			type: 'basic',
			title: 'Kaffeekanne wird bereits abgeholt!',
			message: 'Die Kaffeekanne wird bereits abgeholt.\nSie m\u00fcssen die Kaffeekanne NICHT abholen!',
			iconUrl: 'icons/notify/info.png',
		}
		
		chrome.notifications.create("CoffeePotNotCollected", potTaken, function (id) {
			console.log("<INFORM-USER> Another user already picked up the coffe pot!");
			myNotificationID = id;
		});
	}
	else if(json.type == CONTROL_COFFEE_EVENT && json.control == false && notificationCtr == 1)
	{
	///////////////////////// Notification to inform that a user has agreed to pick up coffee pot //////////////////////////////////
		console.log("<CONTROL-COFFEE> You habe agreed to pick up the coffee can!");
		var getPot = {
			type: 'basic',
			title: 'Kaffeekanne wird abgeholt!',
			message: json.name + ' hat sich bereiterkl\u00e4rt, die Kaffeekanne\nin Geb\u00e4ude ' + buildNr + ' f\u00fcr das ' + floorNr + '. Stockwerk abzuholen!',
			iconUrl: 'icons/notify/coffee-icon.png',	
		}

		chrome.notifications.create("CoffeePotCollected", getPot, function (id) {
			myNotificationID = id;
		});
	}
};

/**
 * On Close change the icon 
 */
function onClose(evt)
{
	console.log("Disconnected from the server!");
	connectedToServer = false;
	disconnectedStyle();
}

/**
 * Listen to events sent by popup.js
 */
chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
  if (msg.tryConnect) {
    tryConnect();
  }
});

chrome.browserAction.onClicked.addListener(()=> {
  var clearing = browser.notifications.clear(cakeNotification);
  clearing.then(() => {
    console.log("<BrowserAction> Cleared!");
  });
});

// Action listener which controlls the button click through an button id
chrome.notifications.onButtonClicked.addListener(replyBtnClick);
// Action listener which controlls the exit
chrome.notifications.onClosed.addListener(function callback(notificationId, byUser) {
	if(byUser == true)
	{
		console.log("<WINDOW-CLOSED> User Interaction - Notification closed!");
		displayBar = false; // Disables the function
		clearInterval(iconTimer); // Stopp the counter
		iconTimer = 0; // Reset the counter variables 
		updateIcon(stopTime); // Calls the function for updating the icon
	}
});

//////////////////////////////////////////// Outsourced source code for the overview ////////////////////////////////////////////////////////
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
					var msg = "true," + usrName + "," + buildNr + "," + floorNr;
					connection.send(msg); // Here you inform the others who have picked the pot
					console.log("<CLIENT-MESSAGE1>: " + msg);
					setTimeout(function() { 
						var msg = "" + usrName + "," + buildNr + "," + floorNr;
						console.log("<CLIENT-MESSAGE2>: " + msg + " has been sent to the server!");
						connection.send(msg); // Here send your data in format: name,building,floor {like csv}
						console.log("<CLIENT> Client to server message could be sent successfully!");
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
	var iconCount0  = 1, iconCount25 = 1, iconCount50 = 1, iconCount75 = 1;
	var time = timer; // Sava parameter as a local variable
	iconUpdate = 0;

	// Animates the Plug-In Icon every time intervall until a certain demolition event happens
	iconUpdate = setInterval(function()
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
				clearInterval(iconUpdate);
				this.statusControl = 0; break;
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
	chrome.browserAction.setIcon({path : {	"38": path }});

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
	var iconCount0  = 1, iconCount25 = 1, iconCount50 = 1, iconCount75 = 1; // Variables to change the icons
	timeUpdate = timer; controllTimer = crtTimer, iconTimer = 0; // Parameters as local variables
	var controllBreak = 0;

	// Animates the Plug-In Icon every time intervall until a certain demolition event happens
	iconTimer = setInterval(function()
	{
		if (controllTimer == 6)
		{
			progTimer++;
			controllTimer = 0;
		}
		if (controllBreak == 5)
		{
			stopTime += 4;
			controllBreak = 0;
		}
		chrome.notifications.clear("msj");

		switch(true) {
			case (timeUpdate >= 0  && timeUpdate < 150) && (iconCount0 == 1):
				var msj = setProgressBar(0); iconCount0 = setIcon(0, 0); break;
			case (timeUpdate >= 0  && timeUpdate < 150) && (iconCount0 == 2):
				var msj = setProgressBar(0); iconCount0 = setIcon(0, 1); break;
			case (timeUpdate >= 0  && timeUpdate < 150) && (iconCount0 == 3):
				var msj = setProgressBar(0); iconCount0 = setIcon(0, 2); break;
			case (timeUpdate >= 0  && timeUpdate < 150) && (iconCount0 == 4):
				var msj = setProgressBar(0); iconCount0 = setIcon(0, 3); break;
			case (timeUpdate > 150 && timeUpdate < 300) && (iconCount25 == 1):
				var msj = setProgressBar(25); iconCount25 = setIcon(25, 0); break;
			case (timeUpdate > 150 && timeUpdate < 300) && (iconCount25 == 2):
				var msj = setProgressBar(25); iconCount25 = setIcon(25, 1);	break;
			case (timeUpdate > 150 && timeUpdate < 300) && (iconCount25 == 3):
				var msj = setProgressBar(25); iconCount25 = setIcon(25, 2);	break;
			case (timeUpdate > 150 && timeUpdate < 300) && (iconCount25 == 4):
				var msj = setProgressBar(25); iconCount25 = setIcon(25, 3); break;
			case (timeUpdate > 300 && timeUpdate < 450) && (iconCount50 == 1):
				var msj = setProgressBar(50); iconCount50 = setIcon(50, 0);	break;
			case (timeUpdate > 300 && timeUpdate < 450) && (iconCount50 == 2):
				var msj = setProgressBar(50); iconCount50 = setIcon(50, 1);	break;
			case (timeUpdate > 300 && timeUpdate < 450) && (iconCount50 == 3):
				var msj = setProgressBar(50); iconCount50 = setIcon(50, 2);	break;
			case (timeUpdate > 300 && timeUpdate < 450) && (iconCount50 == 4):
				var msj = setProgressBar(50); iconCount50 = setIcon(50, 3); break;
			case (timeUpdate > 450 && timeUpdate < 600) && (iconCount75 == 1):
				var msj = setProgressBar(75); iconCount75 = setIcon(75, 0); break;
			case (timeUpdate > 450 && timeUpdate < 600) && (iconCount75 == 2):
				var msj = setProgressBar(75); iconCount75 = setIcon(75, 1); break;
			case (timeUpdate > 450 && timeUpdate < 600) && (iconCount75 == 3):;
				var msj = setProgressBar(75); iconCount75 = setIcon(75, 2); break;
			case (timeUpdate > 450 && timeUpdate < 600) && (iconCount75 == 4):
				var msj = setProgressBar(75); iconCount75 = setIcon(75, 3);	break;
			case (timeUpdate >= 600):
				chrome.notifications.clear("potProgStatus");
				this.statusControl = 1; break;
			case (timeUpdate == 150 || timeUpdate == 300 || timeUpdate == 450):
				this.statusControl = 1; break;
			default:
				chrome.browserAction.setIcon({path : { "38": "icons/iconChange/full.png" }});
				console.log("Failed interval time received or couldnt load plug-in icon!");
				break;
		}
		controllTimer++;
		controllBreak++;
		timeUpdate++; // Time counts largely independent of server time -> controls the time just on certain events
	}, 800); // End of intervall { refreshes the plug-in icon every second }
}
// Sets the icon of the browser plug-in and the progress bar
function setProgressBar(index) {
	// Creates a new notification with the refreshed time
	var track = {
		type: "progress",
		title: "Kaffeekannenstatus",
		message: "Die Kaffeekanne aus Geb\u00e4ude " + buildNr + " Stockwerk " + floorNr + " ist zu " + progTimer + "% fertig zubereitet!",
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
	console.log("<NOTIFICATION> Notification requires Interactions!");
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
	console.log("<NOTIFICATION> Notification last for " + time + " seconds!");
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
// Get the plug-in options, if they dont exist set them to default values
function loadOptions() {
	chrome.storage.sync.get(
	{
		notificationEnabled: 1,
		notificationTrackEnabled: 1,
		timeDisplayed: 1
	}, function(items)  {
		var temp = items.notificationTrackEnabled;
		localStorage.setItem("settingsBar", temp);
		temp = items.notificationEnabled;
		localStorage.setItem("settingsNotification", temp);
		temp = items.timeDisplayed;
		localStorage.setItem("settingsTimeDisplayed", temp);
	});

	var temp = localStorage.getItem("settingsBar");
	temp = parseInt(temp);
	if(temp == 0 || temp == 1)
	{
		statusControl = temp;
	}
	else { statusControl = 1; }

	var temp = localStorage.getItem("settingsNotification");
	temp = parseInt(temp);
	if(temp == 0 || temp == 0)
	{
		notificationCtr = temp;
	}
	else { notificationCtr = 1; }

	var temp = localStorage.getItem("settingsTimeDisplayed");
	temp = parseInt(temp);
	if(temp >= 0 && temp <= 20)
	{
		timeDisplayed = temp;
	}
	else { timeDisplayed = 0; }
}
// Set plug-in style if connected to the server
function connectedStyle() {
	chrome.browserAction.setIcon({path : { "19": "icons/ready/ready19b.png" }}); // Changes the Plug-In Icon
	setTimeout(function(){ chrome.runtime.sendMessage({Connected: true}, function(response) { }); }, 1250); // Communicate 
	console.log("Connected to the server!");
}
// Set plug-in style if disconnected from the server
function disconnectedStyle() {
	if( connectedToServer == false )
	{
		chrome.browserAction.setIcon({path : { "19": "icons/notConnected/notConnected19b.png" }}); // Changes the Plug-In Icon 
		setTimeout(function(){ chrome.runtime.sendMessage({Disconnected: true}, function(response) { }); }, 1250); // Communicate
		console.log("Disconnected from the server!");
	}
}