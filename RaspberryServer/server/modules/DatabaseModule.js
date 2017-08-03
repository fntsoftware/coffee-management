/**************************************
* Module for updateing the database
* and receiving client messages
*
**************************************/
module.exports = function () {
    console.log("<Server> DatabaseModule loaded!"); 
    
    var simplebus = require('simplebus');
    var client = simplebus.createClient(8181);
    
    var WebSocketServer = require("websocketserver");
    var server = new WebSocketServer("all", 9050);

	//////////////////////////////////// Messages ///////////////////////////////////////////////////////////////////////////////////////////////////////////
	const CONTROL_COFFEE_NOTIFICATION_EVENT = 'controlCoffeeNotification';
	const CONTROL_COFFEE_EVENT = 'controlCoffee';
	const RESET_CONTROL_COFFEE_NOTIFICATION_EVENT = 'resetControlCoffeeNotification';
	const INFORM_USER_NOTIFICATION_EVENT = 'informUserNotification';
	/////////////////////////////////// Connect to database and set default structur //////////////////////////////////////////////////////////////////////
	var low = require('lowdb');
	const db = low('/home/pi/git/coffeesnitch/database/userDatabase.json');
	const dbCoffee = low('/home/pi/git/Website/Kaffeeverwaltung_NGINX/assets/coffeeDatabase.json');

	db.defaults({ actions: []  }).write();	// Sets the structur for the user database
	// Sets to structur for the angular database
	dbCoffee.defaults({ building1: {}, building2: {}, building3: {}, summary: {}, coffeeChefKing: {}, coffeeChefEmperor: {}  }).write();
	dbCoffee.defaults({ status: {}, consumption: {},  history: {}, number: [], pot: {}  }).write();
	// Set default for the control of the pots
	for( var i=1; i<=3; i++ )
		for( var j=1; j<=5;j++)
			if( (i == 1 && j <=3) || (i == 3 && j <=3) || (i == 2))  dbCoffee.set( 'pot.building' + i + 'floor' + j, false ).write();
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	server.on("message", function(data, id) 
	{
		console.log("<Database> Message received!");
		
		var count =  db.get('actions').size().value();
		userId = count;
		userDef = 'user' + userId;
		
		/*
		** This function checks if the user already exists (false) and if not it creates a new user (true)
		*/
		function addUser(userName, buildingId, floorId)
		{
			// Updating/Creating the status
			var databaseStatus = "status.building" + buildingId + "floor" + floorId;
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth()+1;
			var yyyy = today.getFullYear();
			var hh = today.getHours();
			var min = today.getMinutes();
			today = hh + ":" + min + " " + dd + ":" + mm + ":" + yyyy;
			
			dbCoffee.set( databaseStatus, 'aktiv' ).write();
			databaseStatus = databaseStatus + "Time"; // Change address field
			dbCoffee.set( databaseStatus, today ).write();
			
			// Updating/Creating the history
			var number = dbCoffee.get('number').map('count').value();
			number = parseInt(number);
			// Checks if it already exists if not create one an set it to one
			if(number > 0)
			{
				var temp;
				if(number < 3)
					temp = number + 1;
				else
					temp = 1;
				dbCoffee.get('number').find({ count: number }).assign({ count: temp }).write();
			} else {
				dbCoffee.get('number').push({ 'count': 1 }).write();
				console.log("Notification id: " + 1 + " created!");
				number = 1;
			}
			
			var historyBuilding = "history.notification" + number + "Building";
			var historyFloor = "history.notification" + number + "Floor";
			var historyTime = "history.notification" + number + "Time";
			dbCoffee.set( historyBuilding,  buildingId).write();
			dbCoffee.set( historyFloor,	floorId).write();
			dbCoffee.set( historyTime, today).write();
			
			/////////////////////////////// Creating user or return false if user already exists ///////////////////////////////////////////////////
			var checkName = db.get('actions').filter({ name: userName }).map('name').value();
			var checkBuilding = db.get('actions').filter({ name: userName }).map('building').value();
			var checkFloor = db.get('actions').filter({ name: userName }).map('floor').value();

			if( checkName.indexOf(userName) >= 0 && checkBuilding.indexOf(buildingId) >= 0 && checkFloor.indexOf(floorId) >= 0 ) 
			{
				if (userName.indexOf("defaultUser") < 0)
				{
					console.log("User already exists!");
					return false;
				} else {
					console.log("Caution defaulUser already exists!");
					return false;
				}
			}
			else
			{
				if (userName.indexOf("defaultUser") < 0)
				{
					/////////////////////// Setting a new user to the database ///////////////////////
					db.get('actions').push({ id:userId, name: userName, building: buildingId, floor: floorId, consumption: 10, number: 1, duration: 8 }).write();
					console.log("New user created!");
					return true;
				}
				else {
					/////////////// Username is defaultUser in this case do nothing /////////////////
					db.get('actions').push({ id:userId, name: "defaultUser", building: buildingId, floor: floorId, consumption: 10, number: 1, duration: 8 }).write();
					console.log("Caution username is defaultUser - new defaultUser created!");
					return true;
				}
			}
		}

		/*
		** This function checks if the user exists and if he does it changes the data of it`s posts
		** field navigation: 1) username 2) building 3) floor 4) consumption 5) number of picks 6) duration of brewing
		*/
		function changeData(userName, buildingId, floorId, field, value)
		{
			var checkName = db.get('actions').filter({ name: userName }).map('name').value();
			var checkBuilding = db.get('actions').filter({ name: userName }).map('building').value();
			var checkFloor = db.get('actions').filter({ name: userName }).map('floor').value();
			
			// Checks if user exists
			if( checkName.indexOf(userName) >= 0 && checkBuilding.indexOf(buildingId) >= 0 && checkFloor.indexOf(floorId) >= 0 ) {
				switch(field) {
					case 1: // Username
						if(value && value !== "" && typeof value === 'string' )
						{
							// Search the username and change it
							db.get('actions').find({ name: userName, building: buildingId , floor: floorId}).assign({ name: value }).write();
							console.log("Username has been changed! The new username is: " + value);
						}
						else{
							console.log("The username value is not a string and because of that cant be changed!");
						}
						break;
					case 2: // Building
						if( !isNaN(value) )
						{
							// Search the building and change it
							db.get('actions').find({ name: userName, building: buildingId , floor: floorId}).assign({ building: value }).write();
							console.log("Building has been changed! The new building is: " + value);
						}
						else
						{
							console.log("The building value is not a valid number and because of that cant be changed!");
						}
						break;
					case 3: // Floor
						if( !isNaN(value) )
						{
							// Search the floor and change it
							db.get('actions').find({ name: userName, building: buildingId , floor: floorId}).assign({ floor: value }).write();
							console.log("Floor has been changed! The new floor is: " + value);
						}
						else
						{
							console.log("The floor value is not a valid number and because of that cant be changed!");
						}
						break;
					case 4: // Consumption
						// Search the consumption, get the value and adds the new value and sets the sum to the new value
						if( !isNaN(value) )
						{
							var conId = db.get('actions').filter({ name: userName, building: buildingId , floor: floorId}).map('consumption').value();
							conId = parseInt(conId);
							var conSum = 0;
							conSum = conId + value;
							
							db.get('actions').find({ name: userName, building: buildingId , floor: floorId}).assign({ consumption: conSum }).write();
							console.log("Consumption has been changed! The new value is now: " + conSum);
						}
						else
						{
							console.log("The consumption value is not a valid number and because of that cant be changed!");
						}
						break;
					case 5: // Number
						// Search the number, get the value and adds the new value and sets the sum to the new value
						if( !isNaN(value) )
						{
							var numId = db.get('actions').filter({ name: userName, building: buildingId , floor: floorId}).map('number').value();
							numId = parseInt(numId);
							var numSum = 0;
							numSum = numId + value;
							
							db.get('actions').find({ name: userName, building: buildingId , floor: floorId}).assign({ number: numSum }).write();
							console.log("Number has been changed! The new number is now: " + numSum);
						}
						else
						{
							console.log("The number value is not a valid number and because of that cant be changed!");
						}
						break;
					case 6: // Duration
						// Search the duration, get the value and adds the new value and sets the sum to the new value
						if( !isNaN(value) )
						{
							var durId = db.get('actions').filter({ name: userName, building: buildingId , floor: floorId}).map('duration').value();
							durId = parseInt(durId);
							var durSum = 0;
							durSum = durId + value;
							
							db.get('actions').find({ name: userName, building: buildingId , floor: floorId}).assign({ duration: durSum }).write();
							console.log("Duration has been changed! The new duration is now: " + durSum);
						}
						else
						{
							console.log("The duration value is not a valid number and because of that cant be changed!");
						}
						break;
					default: // Default
						break;
						console.log(userName + " exists but the field value was wrong! Nothing has been changed!");
				}
				// console.log("The data of " + userName + " has been updated!");	
			}
			else
			{
				console.log("The username is not available. Please check your data!");
			}
		}

		/*
		** This function returns the desired value
		** field navigation: 1) username 2) building 3) floor 4) consumption 5) number of picks 6) duration of brewing
		*/
		function returnData(userName, buildingId, floorId, field)
		{
			switch(field) {
				case 1:
					if( !isNaN(field) )
					{
						var name = db.get('actions').filter({ name: userName, building: buildingId, floor: floorId }).map('name').value();
						return name;
					}
					else {
						console.log("Error in username! The field is not a number.");
					}
					break;
				case 2:
					if( !isNaN(field) )
					{
						var building = db.get('actions').filter({ name: userName, building: buildingId, floor: floorId }).map('building').value();
						building = parseInt(building);
						return building;
					}
					else {
						console.log("Error in building! The field is not a number.");
					}
					break;
				case 3:
					if( !isNaN(field) )
					{
						var floor = db.get('actions').filter({ name: userName, building: buildingId, floor: floorId }).map('floor').value();
						floor = parseInt(floor);
						return floor;
					}
					else {
						console.log("Error in floor! The field is not a number.");
					}
					break;
				case 4:
					if( !isNaN(field) )
					{
						var consumption = db.get('actions').filter({ name: userName, building: buildingId, floor: floorId }).map('consumption').value();
						consumption = parseInt(consumption);
						return consumption;
					}
					else {
						console.log("Error in consumption! The field is not a number.");
					}
					break;
				case 5:
					if( !isNaN(field) )
					{
						var number = db.get('actions').filter({ name: userName, building: buildingId, floor: floorId }).map('number').value();
						number = parseInt(number);
						return number;
					}
					else {
						console.log("Error in number! The field is not a number.");
					}
					break;
				case 6:
					if( !isNaN(field) )
					{
						var duration = db.get('actions').filter({ name: userName, building: buildingId, floor: floorId }).map('duration').value();
						duration = parseInt(duration);
						return duration;
					}
					else {
						console.log("Error in duration! The field is not a number.");
					}
					break;
				default:
					console.log("No valid field selected. Please check your input data!");
					break;
			}
		}

		/*
		** Updates a user
		*/
		function updateUser(userName, building, floor)
		{
			console.log("----- User database -----");
			var check = addUser(userName, building, floor);

			if(check == false)
			{
				console.log("User has been updated!");
				changeData(userName, building, floor, 4, 10); // Updates consumption
				changeData(userName, building, floor, 5, 1); // Updates number
				changeData(userName, building, floor, 6, 8); // Updates duration
			}
		}

		/*
		** This function creates the json codeblock for the angular application
		*/
		function updateAngular()
		{
				console.log("\n----- Angular database -----");
				//////////////////////////////////////////////// Some temporarry variables ////////////////////////////////////////////////////////////////////////////
				var numberEntries =  db.get('actions').size().value();
				var consumSumB1F1 = 0, consumSumB1F2 = 0, consumSumB1F3 = 0;
				var consumSumB2F1 = 0, consumSumB2F2 = 0, consumSumB2F3 = 0, consumSumB2F4 = 0, consumSumB2F5 = 0;
				var consumSumB3F1 = 0, consumSumB3F2 = 0, consumSumB3F3 = 0;
				var consumSumB1 = 0, consumSumB2 = 0, consumSumB3 = 0;
				var coffeeKingName1 = '', coffeeKingConsum1 = 0, coffeeKingName2 = '', coffeeKingConsum2 = 0, coffeeKingName3 = '', coffeeKingConsum3 = 0;
				
				/////////////////////////////////////////////// Goes through every persons data and sums the data up ///////////////////////////////////////////
				// Here we determine the coffee king
				for( var i = 0; i <= numberEntries; i++)
				{
					var building = db.get('actions').filter({ id: i }).map('building').value();
					building = parseInt(building);
					var floor = db.get('actions').filter({ id: i }).map('floor').value();
					floor = parseInt(floor);
					var consumption = db.get('actions').filter({ id: i }).map('consumption').value();
					consumption = parseInt(consumption);
					var name = db.get('actions').filter({ id: i }).map('name').value();
				
					if (name.indexOf("defaultUser") < 0) // Excludes the default user
					{
						if( consumption > coffeeKingConsum1 )
						{
							coffeeKingName3 = coffeeKingName2;
							coffeeKingConsum3 = coffeeKingConsum2;
							coffeeKingName2 = coffeeKingName1;
							coffeeKingConsum2 = coffeeKingConsum1;
							coffeeKingConsum1 = consumption;
							coffeeKingName1 = db.get('actions').filter({ id: i }).map('name').value();
						}
						else if( consumption > coffeeKingConsum2 )
						{
							coffeeKingName3 = coffeeKingName2;
							coffeeKingConsum3 = coffeeKingConsum2;
							coffeeKingConsum2 = consumption;
							coffeeKingName2 = db.get('actions').filter({ id: i }).map('name').value();
						}
						else
						{
							if( consumption > coffeeKingConsum3 )
							{
								coffeeKingConsum3 = consumption;
								coffeeKingName3 = db.get('actions').filter({ id: i }).map('name').value();
							}
						}
					} else {
						console.log("<Database> Attention its the defaultUser is excluded from the statistics!");
					}

					// Sums up the coffee consumption for each building and each floor
					switch(true) {
						case ( (building == 1) && (floor == 1) && (consumption > 0) ):
							consumSumB1F1 = consumSumB1F1 + consumption;
							break;
						case ( (building == 1) && (floor == 2) && (consumption > 0) ):
							consumSumB1F2 = consumSumB1F2 + consumption;
							break;
						case ( (building == 1) && (floor == 3) && (consumption > 0) ):
							consumSumB1F3 = consumSumB1F3 + consumption;
							break;
						case ( (building == 2) && (floor == 1) && (consumption > 0) ):
							consumSumB2F1 = consumSumB2F1 + consumption;
							break;
						case ( (building == 2) && (floor == 2) && (consumption > 0) ):
							consumSumB2F2 = consumSumB2F2 + consumption;
							break;
						case ( (building == 2) && (floor == 3) && (consumption > 0) ):
							consumSumB2F3 = consumSumB2F3 + consumption;
							break;
						case ( (building == 2) && (floor == 4) && (consumption > 0) ):
							consumSumB2F4 = consumSumB2F4 + consumption;
							break;
						case ( (building == 2) && (floor == 5) && (consumption > 0) ):
							consumSumB2F5 = consumSumB2F5 + consumption;
							break;
						case ( (building == 3) && (floor == 1) && (consumption > 0) ):
							consumSumB3F1 = consumSumB3F1 + consumption;
							break;
						case ( (building == 3) && (floor == 2) && (consumption > 0) ):
							consumSumB3F2 = consumSumB3F2 + consumption;
							break;
						case ( (building == 3) && (floor == 3) && (consumption > 0) ):
							consumSumB3F3 = consumSumB3F3 + consumption;
							break;
					}
				}

				consumSumB1 = consumSumB1F1 + consumSumB1F2 + consumSumB1F3;
				consumSumB2 = consumSumB2F1 + consumSumB2F2 + consumSumB2F3 + consumSumB2F4 + consumSumB2F5;
				consumSumB3 = consumSumB3F1 + consumSumB3F2 + consumSumB3F3;

				/////////////////////////////////////// Sets the data into the json file  /////////////////////////////////////////////
				// Sets the structur for the angular application
				dbCoffee.defaults({ building1: {}, building2: {}, building3: {}, summary: {}, coffeeChefKing: {}, coffeeChefEmperor: {}  }).write();
				dbCoffee.defaults({ status: {}, consumption: {},  history: {}, number: [] }).write();
				// Sets the values for the top points if they didn`t exists before
				console.log("Angular database has been refreshed!")
				dbCoffee.set( 'consumption.consumptionb3f1', 30 ).write();
				dbCoffee.set( 'consumption.consumptionb3f2', 20 ).write();
				dbCoffee.set( 'consumption.consumptionb3f3', 30 ).write();
				
				dbCoffee.set( 'consumption.averageb3f1', 70 ).write();
				dbCoffee.set( 'consumption.averageb3f2', 25 ).write();
				dbCoffee.set( 'consumption.averageb3f3', 73 ).write();
				
				dbCoffee.set( 'building1.floor1' , consumSumB1F1 ).write();
				dbCoffee.set( 'building1.floor2' , consumSumB1F2 ).write();
				dbCoffee.set( 'building1.floor3' , consumSumB1F3 ).write();
				dbCoffee.set( 'building2.floor1' , consumSumB2F1 ).write();
				dbCoffee.set( 'building2.floor2' , consumSumB2F2 ).write();
				dbCoffee.set( 'building2.floor3' , consumSumB2F3 ).write();
				dbCoffee.set( 'building2.floor4' , consumSumB2F4 ).write();
				dbCoffee.set( 'building2.floor5' , consumSumB2F5 ).write();
				dbCoffee.set( 'building3.floor1' , consumSumB3F1 ).write();
				dbCoffee.set( 'building3.floor2' , consumSumB3F2 ).write();
				dbCoffee.set( 'building3.floor3' , consumSumB3F3 ).write();
				
				dbCoffee.set( 'summary.building1' , consumSumB1 ).write();
				dbCoffee.set( 'summary.building1' , consumSumB2 ).write();
				dbCoffee.set( 'summary.building1' , consumSumB3 ).write();

				dbCoffee.set( 'coffeeChefKing.name1' , coffeeKingName1 ).write();
				dbCoffee.set( 'coffeeChefKing.consumption1' , coffeeKingConsum1 ).write();
				dbCoffee.set( 'coffeeChefKing.name2' , coffeeKingName2 ).write();
				dbCoffee.set( 'coffeeChefKing.consumption2' , coffeeKingConsum2 ).write();
				dbCoffee.set( 'coffeeChefKing.name3' , coffeeKingName3 ).write();
				dbCoffee.set( 'coffeeChefKing.consumption3' , coffeeKingConsum3 ).write();
				
				dbCoffee.set( 'coffeeChefEmperor.name' , 'Konstantin' ).write();
				dbCoffee.set( 'coffeeChefEmperor.consumption' , '70' ).write();
				
				// Set values if not set already
				if( dbCoffee.has( 'history.notification1Building' ).value() == false )
					dbCoffee.set( 'history.notification1Building', 0 ).write();
				if( dbCoffee.has( 'history.notification1Floor' ).value() == false )
					dbCoffee.set( 'history.notification1Floor', 0 ).write();
				if( dbCoffee.has( 'history.notification1Time' ).value() == false )
					dbCoffee.set( 'history.notification1Time', '00:00 00:00:0000' ).write();
				
				if( dbCoffee.has( 'history.notification2Building' ).value() == false )
					dbCoffee.set( 'history.notification2Building', 0 ).write();
				if( dbCoffee.has( 'history.notification2Floor' ).value() == false )
					dbCoffee.set( 'history.notification2Floor', 0 ).write();
				if( dbCoffee.has( 'history.notification2Time' ).value() == false )
					dbCoffee.set( 'history.notification2Time', '00:00 00:00:0000' ).write();
				
				if( dbCoffee.has( 'history.notification3Building' ).value() == false )
					dbCoffee.set( 'history.notification3Building', 0 ).write();
				if( dbCoffee.has( 'history.notification3Floor' ).value() == false )
					dbCoffee.set( 'history.notification3Floor', 0 ).write();
				if( dbCoffee.has( 'history.notification3Time' ).value() == false )
					dbCoffee.set( 'history.notification3Time', '00:00 00:00:0000' ).write();
				
				// Set values if not set already
				for( var m=1; m<=3; m++ )
					for( var n=1; n<=5;n++)
						if( (m == 1 && n <=3) || (m == 3 && n <=3) || (m == 2))
						{
							if( dbCoffee.has( 'status.building' + m + 'floor' + n ).value() == false )
								dbCoffee.set( 'status.building' + m + 'floor' + n, "inaktiv" ).write();
							if( dbCoffee.has( 'status.building' + m + 'floor' + n + 'Time' ).value() == false )
								dbCoffee.set( 'status.building' + m + 'floor' + n + 'Time', "unbekannt" ).write();
						}
		}

		//////////////////////// Here it receives the client-message and takes action //////////////////////////////////////
		var mes = server.unmaskMessage(data);
		var str = server.convertToString(mes.message);  // Get the client-message and convert it to a string
		
		// Here it checks the message for spicific content -> client messages are similary to csv
		if(str.indexOf("true") < 0 && str.indexOf("false") < 0)
		{
			/////// Client message to enter to the database ///////
			console.log("<Database> Client message: " + str);

			// Get the name
			var index = str.indexOf(",");
			var name = str.slice(0,index);
			
			// Get the building
			str = str.slice(index+1);
			index = str.indexOf(",");
			var str2 = str.slice(0,index);
			var building = parseInt(str2);
			
			// Get the floor
			str = str.slice(index+1);
			var floor = parseInt(str);
			
			updateUser(name,building,floor); // Here it updates the database!!!
			updateAngular(); // Here it creates json data for the website
		}  
		else if(str.indexOf("true") >= 0 || str.indexOf("false") >= 0) 
		{	
			////// Client message to prevent re-access to pick-up the pot ///////
			// Get the name
			var index = str.indexOf(",");
			str = str.slice(index+1);
			index = str.indexOf(",");
			var nameLoc = str.slice(0,index);

			// Get the building
			str = str.slice(index+1);
			index = str.indexOf(",");
			var str2 = str.slice(0,index);
			var buildingLoc = parseInt(str2);

			// Get the floor
			str = str.slice(index+1);
			var floorLoc = parseInt(str);
			var check = "pot.building" + buildingLoc + "floor" + floorLoc;
			
			// Check the database to see if the pot is still to be picked up
			if( dbCoffee.get(check).value() == false )
			{
				dbCoffee.set( 'pot.building' + buildingLoc + 'floor' + floorLoc, true ).write();
				client.post({ type: CONTROL_COFFEE_NOTIFICATION_EVENT, control: false, building: buildingLoc, floor: floorLoc, name: nameLoc });
				console.log("<Database> A user has agreed to pick up the coffee pot!");
			}
			else {
				console.log("<Database> Pot already taken building: " + buildingLoc);
				client.post({ type: INFORM_USER_NOTIFICATION_EVENT, building: buildingLoc, floor: floor });
			}
		}
	});      

	/* Events */  
    client.start(function()
	{	
		console.log("<Database> Client started!");
		
		client.subscribe({ type: RESET_CONTROL_COFFEE_NOTIFICATION_EVENT }, function(msg) 
		{ 
        	console.log("<Database> Coffee pot be re-released for pickup in building: " + msg.building + " floor " + msg.floor);
			dbCoffee.set( 'pot.building' + msg.building + 'floor' + msg.floor, false ).write();
    	});
	 }); // Event Handler
	 
}; // Module