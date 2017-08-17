// If user is running mozilla then use it's built-in WebSocket
window.WebSocket = window.WebSocket || window.MozWebSocket;

/////////////////////////////////////////////// Attributes and Events //////////////////////////////////////////////////////// 
var INCOMMING_POT_EVENT = "incommingPot", POT_READY_EVENT = "potReady", POT_UPDATE_EVENT = "potUpdate", CONTROL_COFFEE_EVENT = 'controlCoffee', INFORM_USER_EVENT = 'informUser', CONNECTED_EVENT = 'userConnected';
var sockets = [], connection, connectedToServer = false; // Variables for the websocket connection
var timeDisplayed = 0, progTimer = 0, iconTimer = 0, displayBar = true, status = 0; // Variables to controll the progress bar
var myNotificationID = null, statusControl = '', notificationCtr = '', icon = "icons/ready/ready48b.png"; // Variables to controll the notifications
var buildNr = localStorage.getItem("buildNr"), floorNr = localStorage.getItem("floorNr"), usrName = localStorage.getItem("usrName");; // User information
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
    // Checks for the styling of the plug-in
	if(connectedToServer == false)
	{
		console.log("<RASPBERRY-SERVER> User not connected to the server!");
		setTimeout(function(){ 
			if(connectedToServer == false) {
				disconnectedStyle();	
			}
		}, 3000);

	} else if(connectedToServer == true) {
		console.log("<RASPBERRY-SERVER> User connected to the server!");
		disconnectedStyle();
	}
};

/**
 * On Error 
 */
function onError(error) {
    console.log("<ERROR> Server not available");
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
        console.log('<Server> This doesn\'t look like a valid JSON: ', message.data);
        return;
    }
	
	// Load the plug-in options into the application	
	loadOptions();
	
	///////////////////////////////// Different messages for the user ///////////////////////////////////////////////////////////////
    if(json.type == INCOMMING_POT_EVENT && json.potId == floorNr && notificationCtr == "JA")
    {
	////////////////////////////////// Pot is filled ////////////////////////////////////////////////////////////////////////////////
		localStorage.setItem("progressTime", 0);
		chrome.runtime.sendMessage({UPDATE_BAR: true}, function(response) { });
		setTimeout(function(){ 
			console.log("<INCOMMING-POT> Coffee can has arrived an is brewing!");
			chrome.runtime.sendMessage({INCOMMING_POT: true, building: buildNr, floor: floorNr}, function(response) { });
		}, 1250);
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
		status = 0;
    }
    else if(json.type == POT_READY_EVENT && json.potId == floorNr && notificationCtr == "JA")
    {
	///////////////////////////////// Pot Ready Notification ///////////////////////////////////////////////////////////////////////
		console.log("<POT-READY>Coffee can is ready and can be picked up!");
		chrome.browserAction.setIcon({path : { "19": "icons/ready/ready19b.png", "38": "icons/ready/ready38b.png" }});
		
		// Creating a rich notification with two buttions and an id to call up the button events
		var notificationCoffee = {
			type: 'basic',
			iconUrl: 'icons/notify/coffee-icon.png',
			title: 'Kaffeekanne ist fertig!',
			message: 'Die Kaffeekanne in Geb\u00e4ude ' +  buildNr + ' \nim ' + floorNr + '. Stockwerk ist fertig!\nWollen Sie die Kaffeekanne abholen?',
			};
		chrome.notifications.create("potReady", notificationCoffee, function (id) { }); 

		clearInterval(iconTimer); // Stop timer
		displayBar = true; // Enables progressbar
		chrome.runtime.sendMessage({POT_READY: true, building: buildNr, floor: floorNr}, function(response) { console.log("Message sendt!") }); // Send message
	}
	else if(json.type == POT_UPDATE_EVENT && json.potId == floorNr && statusControl == "JA" && notificationCtr == "JA")
    {
	///////////////////////// Displays a progress bar and changes the plug-in icon /////////////////////////////////////////////////
		console.log("<POT-UPDATE> Progressbar updated")
		var timer = 0, crtTimer = 0, htmlTime = 0;
		clearInterval(iconTimer);
		switch(json.timeId) {
			case 0:   timer = 0; progTimer = 0; crtTimer = 0; htmlTime = 0; break;
			case 120: timer = 151; progTimer = 25; crtTimer = 0; htmlTime = 121; break;
			case 240: timer = 301; progTimer = 50; crtTimer = 0; htmlTime = 241; break;
			case 360: timer = 451; progTimer = 75; crtTimer = 0; htmlTime = 361; break;
			case 480: timer = 600; progTimer= 100; crtTimer = 0; htmlTime = 480; break;
			default: break;
		}
		// Protects against unwanted calls from the server
		this.statusControl = "pleaseWait";
		// Calls a function which changes the plug-in icon and the progress bar
		updateIconAndBar(timer, crtTimer);
		// Update HTML progress bar
		chrome.runtime.sendMessage({POT_PREPARED: true, building: buildNr, floor: floorNr}, function(response) { });
	}
	else if(json.type == POT_UPDATE_EVENT && json.potId == floorNr && statusControl == "NEIN" && notificationCtr == "JA")
	{
	///////////////////////// Changes just the plug-in icon - Progress bar isnt displayed //////////////////////////////////////////
		console.log("<POT-UPDATE> Time update received!");
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
		chrome.runtime.sendMessage({POT_PREPARED: true, building: buildNr, floor: potNd}, function(response) { });
	} else if(json.type == CONNECTED_EVENT && connectedToServer == false) 
	{       
		connectedToServer = true;
		connectedStyle();
	}

	if(json.type == INFORM_USER_EVENT && json.floor == floorNr && notificationCtr == "JA") 
	{
	///////////////////////// Notification to inform that another user already picked up the coffee pot ////////////////////////////
		var potTaken = {
			type: 'basic',
			title: 'Kaffeekanne wird bereits abgeholt!',
			message: 'Die Kaffeekanne wird bereits abgeholt.\nSie m\u00fcssen die Kaffeekanne NICHT abholen!',
			iconUrl: 'icons/notify/info.png',
		}
		
		chrome.notifications.create("CoffeePotNotCollected", potTaken, function (id) {
			console.log("<INFO> Another user already picked up the coffe pot!");
			chrome.runtime.sendMessage({POT_TAKEN: true}, function(response) { });
		});
	}
	else if(json.type == CONTROL_COFFEE_EVENT && json.control == false && notificationCtr == "JA")
	{
	///////////////////////// Notification to inform that a user has agreed to pick up coffee pot //////////////////////////////////
		console.log("Sercer message: " + json.control + " " + json.building + " " + json.floor + " " + json.name);
		// creates a rich notification just to notify the user
		var getPot = {
			type: 'basic',
			title: 'Kaffeekanne wird abgeholt!',
			message: json.name + ' hat sich bereiterkl\u00e4rt, die Kaffeekanne\nin Geb\u00e4ude ' + buildNr + ' f\u00fcr das ' + floorNr + '. Stockwerk abzuholen!',
			iconUrl: 'icons/notify/coffee-icon.png',	
		}

		chrome.notifications.create("CoffeePotCollected", getPot, function (id) {
			console.log("A user has agreed to pick up the coffee pot!");
			chrome.runtime.sendMessage({POT_GET: true}, function(response) { });
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
	disconnectedStyle();
}

/**
 * Listen to events sent by popup.js
 */
chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
	if (msg.tryConnect) 
		tryConnect();
	if (msg.buttonClick)
		replyBtnClick();
});

chrome.browserAction.onClicked.addListener(()=> {
  var clearing = browser.notifications.clear(cakeNotification);
  clearing.then(() => {
    console.log("cleared");
  });
});

/////////////////////////////// Outsourced source code for the overview ////////////////////////////////////
// Reacts to the button click
function replyBtnClick() {	
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
				console.log("<Client-Message1>: " + msg);
				setTimeout(function() { 
					var msg = "" + usrName + "," + buildNr + "," + floorNr;
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
}
// Closes all websocket connections to prevent multiple logon
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
	iconTimer = setInterval(function()
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
		localStorage.setItem("progressTime", displayProgress);
		time++; // Time counts largely independent of server time -> controls the time just on certain events
	}, 1000); // End of intervall { refreshes the plug-in icon every second }
}
// Sets the icon of the browser plug-in
function setIcon(index1, index2) {
	// tpyeNumber consists of: status number {0, 25, 50 ...} and current status of the icon {0, 1, 2 ...} in format number1.number2
	var typeNumber = index1 + "." + index2;
	var path = "icons/iconChange/empty" + typeNumber + ".png";
	chrome.browserAction.setIcon({path : { "38": path }});

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
	var iconCount0  = 1, iconCount25 = 1, iconCount50 = 1, iconCount75 = 1;
	timeUpdate = timer; controllTimer = crtTimer, iconTimer = 0; // Parameters as local variables
	var checkTime = 0;

	// Animates the Plug-In Icon every time intervall until a certain demolition event happens
	iconTimer = setInterval(function()
	{ 
		if (controllTimer == 6)
		{
			progTimer++;
			controllTimer = 0;
		}

		if(checkTime == 6) {
			status++;
			checkTime = 0;
			localStorage.setItem("progressTime", status);
			chrome.runtime.sendMessage({UPDATE_BAR: true}, function(response) { });
		}
		chrome.notifications.clear("msj");

		switch(true) {
			case (timeUpdate >= 0  && timeUpdate < 150) && (iconCount0 == 1):  iconCount0 = setIcon(0, 0); break;
			case (timeUpdate >= 0  && timeUpdate < 150) && (iconCount0 == 2):  iconCount0 = setIcon(0, 1); break;
			case (timeUpdate >= 0  && timeUpdate < 150) && (iconCount0 == 3):  iconCount0 = setIcon(0, 2); break;
			case (timeUpdate >= 0  && timeUpdate < 150) && (iconCount0 == 4):  iconCount0 = setIcon(0, 3); break;
			case (timeUpdate > 150 && timeUpdate < 300) && (iconCount25 == 1): iconCount25 = setIcon(25, 0); break;
			case (timeUpdate > 150 && timeUpdate < 300) && (iconCount25 == 2): iconCount25 = setIcon(25, 1); break;
			case (timeUpdate > 150 && timeUpdate < 300) && (iconCount25 == 3): iconCount25 = setIcon(25, 2); break;
			case (timeUpdate > 150 && timeUpdate < 300) && (iconCount25 == 4): iconCount25 = setIcon(25, 3); break;
			case (timeUpdate > 300 && timeUpdate < 450) && (iconCount50 == 1): iconCount50 = setIcon(50, 0); break;
			case (timeUpdate > 300 && timeUpdate < 450) && (iconCount50 == 2): iconCount50 = setIcon(50, 1); break;
			case (timeUpdate > 300 && timeUpdate < 450) && (iconCount50 == 3): iconCount50 = setIcon(50, 2); break;
			case (timeUpdate > 300 && timeUpdate < 450) && (iconCount50 == 4): iconCount50 = setIcon(50, 3); break;
			case (timeUpdate > 450 && timeUpdate < 600) && (iconCount75 == 1): iconCount75 = setIcon(75, 0); break;
			case (timeUpdate > 450 && timeUpdate < 600) && (iconCount75 == 2): iconCount75 = setIcon(75, 1); break;
			case (timeUpdate > 450 && timeUpdate < 600) && (iconCount75 == 3): iconCount75 = setIcon(75, 2); break;
			case (timeUpdate > 450 && timeUpdate < 600) && (iconCount75 == 4): iconCount75 = setIcon(75, 3); break;
			case (timeUpdate == 150 || timeUpdate == 300 || timeUpdate == 450 || timeUpdate == 0):
				console.log("<PROGRESSBAR> Status notification has been updated! ", timeUpdate);
				var notificationTime = 0;
				switch(timeUpdate) {
					case 0: icon = "icons/progBar/progBar-empty.png"; notificationTime = 0; break;
					case 150: icon = "icons/progBar/progBar-empty25.png"; notificationTime = 25; break;
					case 300: icon = "icons/progBar/progBar-empty50.png"; notificationTime = 50; break;
					case 450: icon = "icons/progBar/progBar-empty75.png"; notificationTime = 75; break;
					case 600: icon = "icons/progBar/progBar-empty100.png";notificationTime = 100; break;
				}

				var track = {
					type: 'basic',
					title: 'Kaffeekannenstatus!',
					message: 'Die Kaffeekanne aus Geb\u00e4ude ' + buildNr + ' Stockwerk ' + floorNr + ' ist zu ' + notificationTime + '% fertig zubereitet!',
					iconUrl: icon,	
				}

				// Creates a notification to inform the user
				chrome.notifications.create("potProgStatus", track, function (id) { myNotificationID = id; });
				clearInterval(iconTimer);
				this.statusControl = "JA";
				break;
			case (timeUpdate >= 600):
				clearInterval(iconTimer);
				this.statusControl = "JA";
				break;
			default:
				chrome.browserAction.setIcon({path : { "38": "icons/iconChange/full.png" }});
				console.log("Failed to receive the interval time or couldnt load plug-in icon!");
				break;
		}
		checkTime++;
		controllTimer++;
		timeUpdate++; // Time counts largely independent of server time -> controls the time just on certain events
	}, 800); // End of intervall { refreshes the plug-in icon every second }
}
// Load plug-in options from storage
function loadOptions() {
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

	// Check the progress bar notification settings
	var temp = localStorage.getItem("settingsBar");
	temp = temp.toUpperCase();
	if(temp.indexOf("JA") >= 0 || temp.indexOf("NEIN") >= 0)
	{
		statusControl = temp;
	}
	else { statusControl = "JA"; }

	// Check the general notification setting
	var temp = localStorage.getItem("settingsNotification");
	temp = temp.toUpperCase();
	if(temp.indexOf("JA") >= 0 || temp.indexOf("NEIN") >= 0)
	{
		notificationCtr = temp;
	}
	else { notificationCtr = "JA"; }
	
	// Check the display time of the notification
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
		setTimeout(function(){ 
			chrome.runtime.sendMessage({Disconnected: true}, function(response) { }); 
		}, 1250); // Communicate
		console.log("Disconnected from the server!");
	}
}