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

	//////////////////////////////////// Messages /////////////////////////////////////////////////////////////////////////////////////////////////////////////
	const CONTROL_COFFEE_NOTIFICATION_EVENT = 'controlCoffeeNotification', CONTROL_COFFEE_EVENT = 'controlCoffee';
	const DATABASE_UPDATE_NOTIFICATION_EVENT = 'databaseUpdateNotification';
	const RESET_CONTROL_COFFEE_NOTIFICATION_EVENT = 'resetControlCoffeeNotification';
	const INFORM_USER_NOTIFICATION_EVENT = 'informUserNotification';
	/////////////////////////////////// Connect to database and set default structur //////////////////////////////////////////////////////////////////////
	var low = require('lowdb');
	const db = low('/home/pi/git/coffeesnitch/database/userDatabase.json'); // Creates a database only for the user information
	const dbCoffee = low('/home/pi/git/Website/Kaffeeverwaltung_NGINX/assets/coffeeDatabase.json'); // Creates a database only for the website content
	const dbMemory = low('/home/pi/git/coffeesnitch/database/memoryDatabase.json'); // Creates a database which stores intermediate values
	
	////////////////////////////////// Set the default structur for the user database /////////////////////////////////////////////////////////////////////
	db.defaults({ actions: []  }).write();
	dbCoffee.defaults({ building1: {}, building2: {}, building3: {}, coffeeChefKing: {}, status: {}, consumption: {},  history: {}, pot: {} }).write();
	dbMemory.defaults({ buildings: [], number: [], consumption: [] }).write();

	for( var i=1; i<=3; i++ )
		for( var j=1; j<=5;j++)
			if( (i == 1 && j <=3) || (i == 3 && j <=3) || (i == 2))  dbCoffee.set( 'pot.building' + i + 'floor' + j, false ).write();
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	/*
	** This function updates all tables of the angular database which only needs to know the building and floor
	*/
	function automaticAngularUpdate(buildingId, floorId) {
		console.log("\n-----<Angular> GENERAL DATABASE -----");
		///////////////////////////////////// Updating status of the coffeeDatabase  //////////////////////////////////////////////
		today = formatDate(new Date()); // Current time and date 
		
		var databaseStatus = "status.building" + buildingId + "floor" + floorId;
		dbCoffee.set( databaseStatus, 'aktiv' ).write();
		databaseStatus = databaseStatus + "Time"; // Modify table name
		dbCoffee.set( databaseStatus, today ).write();
		/////////////////////////////////// Updating history of the coffeeDatabase ////////////////////////////////////////////////
		today = currentDate(new Date()); // Current time and date 
		var number = dbMemory.get('number').map('count').value(), temp = 0; // Queries the number of the post from 1 to 3 possible
		number = parseInt(number);
		// Checks if history already exists if not create one an set it to first possible post (1)
		switch(number) {
			case 1: case 2:
				temp = number + 1; 
				dbMemory.get('number').find({ count: number }).assign({ count: temp }).write(); break;
			case 3:
				temp = 1;
				dbMemory.get('number').find({ count: number }).assign({ count: temp }).write(); break;
			default:
				dbMemory.get('number').push({ 'count': 1 }).write();
				number = 1; break;
		}
	
		var historyBuilding = "history.notification" + number + "Building"; // Strings to address the table names
		var historyFloor = "history.notification" + number + "Floor";
		var historyTime = "history.notification" + number + "Time";
		dbCoffee.set( historyBuilding,  buildingId).write(); // Write into the tables
		dbCoffee.set( historyFloor,	floorId).write();
		dbCoffee.set( historyTime, today).write();
		//////////////////////////////////////////////////////// Updating building and floor /////////////////////////////////////////////
		for(var i = 0; i <= 10; i++)
		{
			// Go through each building and check if its already set if not set it
			var checkBuilding = dbMemory.get('buildings').filter({ id:i }).map('control').value();
			if(checkBuilding.indexOf('true') < 0) 
			{
				switch(i) {
					case 0:
						dbMemory.get('buildings').push({ building1floor1: 0, pickUpCount: 0, date: today, id: 0, control: "true" }).write(); break;
					case 1:
						dbMemory.get('buildings').push({ building1floor2: 0, pickUpCount: 0, date: today, id: 1, control: "true" }).write(); break;
					case 2:
						dbMemory.get('buildings').push({ building1floor3: 0, pickUpCount: 0, date: today, id: 2, control: "true" }).write(); break;
					case 3:
						dbMemory.get('buildings').push({ building2floor1: 0, pickUpCount: 0, date: today, id: 3, control: "true" }).write(); break;
					case 4:
						dbMemory.get('buildings').push({ building2floor2: 0, pickUpCount: 0, date: today, id: 4, control: "true" }).write(); break;
					case 5:
						dbMemory.get('buildings').push({ building2floor3: 0, pickUpCount: 0, date: today, id: 5, control: "true" }).write(); break;
					case 6:
						dbMemory.get('buildings').push({ building2floor4: 0, pickUpCount: 0, date: today, id: 6, control: "true" }).write(); break;
					case 7:
						dbMemory.get('buildings').push({ building2floor5: 0, pickUpCount: 0, date: today, id: 7, control: "true" }).write(); break;
					case 8:
						dbMemory.get('buildings').push({ building3floor1: 0, pickUpCount: 0, date: today, id: 8, control: "true" }).write(); break;
					case 9:
						dbMemory.get('buildings').push({ building3floor2: 0, pickUpCount: 0, date: today, id: 9, control: "true" }).write(); break;
					case 10:
						dbMemory.get('buildings').push({ building3floor3: 0, pickUpCount: 0, date: today, id: 10, control: "true" }).write(); break;
				}
			}	
		}
		
		// Checks if building already exists in the database if not it creates one and set it to default values
		if( dbCoffee.has( 'building1.floor1' ).value() == false )
			dbCoffee.set( 'building1.floor1', 0 ).write();
		if( dbCoffee.has( 'builfing1.floor2' ).value() == false )
			dbCoffee.set( 'building1.floor2', 0 ).write();
		if( dbCoffee.has( 'building1.floor3' ).value() == false )
			dbCoffee.set( 'building1.floor3', 0 ).write();

		if( dbCoffee.has( 'building2.floor1' ).value() == false )
			dbCoffee.set( 'building2.floor1', 0 ).write();
		if( dbCoffee.has( 'builfing2.floor2' ).value() == false )
			dbCoffee.set( 'building2.floor2', 0 ).write();
		if( dbCoffee.has( 'building2.floor3' ).value() == false )
			dbCoffee.set( 'building2.floor3', 0 ).write();
		if( dbCoffee.has( 'building2.floor4' ).value() == false )
			dbCoffee.set( 'building2.floor4', 0 ).write();
		if( dbCoffee.has( 'building2.floor5' ).value() == false )
			dbCoffee.set( 'building2.floor5', 0 ).write();

		if( dbCoffee.has( 'building3.floor1' ).value() == false )
			dbCoffee.set( 'building3.floor1', 0 ).write();
		if( dbCoffee.has( 'builfing3.floor2' ).value() == false )
			dbCoffee.set( 'building3.floor2', 0 ).write();
		if( dbCoffee.has( 'building3.floor3' ).value() == false )
			dbCoffee.set( 'building3.floor3', 0 ).write();

		var addressId = 0, tableName = "";
		switch(true) {
			case( (buildingId == 3) && (floorId == 1) ): addressId = 8;  tableName = "building3floor1"; break;
			case( (buildingId == 3) && (floorId == 2) ): addressId = 9;  tableName = "building3floor2"; break;
			case( (buildingId == 3) && (floorId == 3) ): addressId = 10; tableName = "building3floor3"; break;
		}

		// Get consumption and add the coffee pot value
		var buildingConsumption = dbMemory.get('buildings').filter({ id: addressId }).map(tableName).value(); 
		buildingConsumption = parseFloat(buildingConsumption);
		buildingConsumption = buildingConsumption + 2.2;;
		buildingConsumption = buildingConsumption.toFixed(2);

		// Change date and the count of collected coffee pots
		var checkDate = dbMemory.get('buildings').filter({ id: addressId }).map('date').value();
		var buildingCount = dbMemory.get('buildings').filter({ id: addressId }).map('pickUpCount').value(); 
		buildingCount = parseFloat(buildingCount);
		if((checkDate.indexOf(today) < 0) || buildingCount == 0)
		{
			buildingCount = buildingCount + 1;
			dbMemory.get('buildings').find({ id: addressId }).assign({ pickUpCount: buildingCount }).write();
			dbMemory.get('buildings').find({ id: addressId }).assign({ date: today }).write();
		}

		switch(true) { // Change the database data (get the old one and update it)
			case ( (buildingId == 3) && (floorId == 1) ):
				dbMemory.get('buildings').find({ id: 8 }).assign({ building3floor1 : buildingConsumption }).write();
				dbCoffee.set( 'building3.floor1', buildingConsumption ).write();
				break;
			case ( (buildingId == 3) && (floorId == 2) ):
				dbMemory.get('buildings').find({ id: 9 }).assign({ building3floor2 : buildingConsumption }).write();
				dbCoffee.set( 'building3.floor2', buildingConsumption ).write();
				break;
			case ( (buildingId == 3) && (floorId == 3) ):
				dbMemory.get('buildings').find({ id: 10 }).assign({ building3floor3 : buildingConsumption }).write(); 
				dbCoffee.set( 'building3.floor3', buildingConsumption ).write();
				break;
			default:
				console.log("<Database> Error updating building consumption!");
				break;
		}
		//////////////////////////////////////////// Updating the daily consumption ////////////////////////////////////////////////////////
		var today = currentDate(new Date()); // Current date without time
		var checkDate = dbMemory.get('consumption').filter({ date: today }).map('date').value(); // Choose current date object from the database

		// Checks if consumption already exists in the database if not it creates one and set it to default values
		if(dbCoffee.has( 'consumption.consumptionb3f1' ).value() == false)
			dbCoffee.set( 'consumption.consumptionb3f1', 0 ).write();
		if(dbCoffee.has( 'consumption.consumptionb3f2' ).value() == false)
			dbCoffee.set( 'consumption.consumptionb3f2', 0 ).write();
		if(dbCoffee.has( 'consumption.consumptionb3f3' ).value() == false)
			dbCoffee.set( 'consumption.consumptionb3f3', 0 ).write();

		if(dbCoffee.has( 'consumption.averageb3f1' ).value() == false)
			dbCoffee.set( 'consumption.averageb3f1', 0 ).write();
		if(dbCoffee.has( 'consumption.averageb3f2' ).value() == false)
			dbCoffee.set( 'consumption.averageb3f2', 0 ).write();
		if(dbCoffee.has( 'consumption.averageb3f3' ).value() == false)
			dbCoffee.set( 'consumption.averageb3f3', 0 ).write();

		// Checks if consumption in the memory already exists if not it creates one
		if(checkDate.indexOf(today) < 0)
			dbMemory.get('consumption').push({ date: today, building1floor1: 0, building1floor2: 0, building1floor3: 0,
												building2floor1: 0, building2floor2: 0, building2floor3: 0, building2floor4: 0, building2floor5: 0,
												building3floor1: 0, building3floor2: 0, building3floor3: 0 }).write();

		var destinationBuilding = "building" + buildingId + "floor" + floorId; // Strings to address the table names
		var destinationAverage = "consumption.averageb" + buildingId + "f" + floorId;
		var getConsumption = dbMemory.get('consumption').filter({ date: today }).map(destinationBuilding).value(); // Get total consumption
		getConsumption = parseFloat(getConsumption);
		getConsumption = getConsumption + 2.2; // Adds a coffee pot consumption (2.2)
		getConsumption = getConsumption.toFixed(2);
		
		switch(true) { // Change the consumption the the new value
			case ((buildingId == 3) && (floorId == 1)):
				dbMemory.get('consumption').find({ date: today }).assign({ building3floor1 : getConsumption }).write(); 
				var idSearch = 8; break;
			case ((buildingId == 3) && (floorId == 2)):
				dbMemory.get('consumption').find({ date: today }).assign({ building3floor2 : getConsumption }).write(); 
				var idSearch = 9; break;
			case ((buildingId == 3) && (floorId == 3)):
				dbMemory.get('consumption').find({ date: today }).assign({ building3floor3 : getConsumption }).write(); 
				var idSearch = 10; break;
			default:
				console.log("<Database> ERROR - Determination of dail consumption failed!"); break;
		}

		var destinationConsumption = "consumption.consumptionb" + buildingId + "f" + floorId;
		dbCoffee.set(destinationConsumption, getConsumption ).write();

		var getAll = dbMemory.get('buildings').filter({ id:idSearch }).map(destinationBuilding).value();
		getAll = parseFloat(getAll);

		var getCount = dbMemory.get('buildings').filter({ id:idSearch }).map('pickUpCount').value();
		getCount = parseFloat(getCount);

		var average = getAll / getCount;
		average = average.toFixed(2);
		dbCoffee.set( destinationAverage, average ).write();
		////////////////////////////////////////////////// History and status defualt /////////////////////////////////////////////////////
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
		console.log("Angular general database has been refreshed!");
	}
		
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
			var checkName = db.get('actions').filter({ name: userName }).map('name').value();
			var checkBuilding = db.get('actions').filter({ name: userName }).map('building').value();
			var checkFloor = db.get('actions').filter({ name: userName }).map('floor').value();

			if( checkName.indexOf(userName) >= 0 && checkBuilding.indexOf(buildingId) >= 0 && checkFloor.indexOf(floorId) >= 0 ) 
			{
				if (userName.indexOf("defaultUser") < 0)
					console.log("User already exists!");
				else 
					console.log("Caution defaulUser already exists!");

				return false;
			}
			else
			{
				if (userName.indexOf("defaultUser") < 0)
				{
					/////////////////////// Setting a new user to the database /////////////////////////////
					db.get('actions').push({ id:userId, name: userName, building: buildingId, floor: floorId, consumption: 2.2, number: 1, duration: 8 }).write();
					console.log("New user created!");
				}
				else {
					/////////////// Username is defaultUser in this case update defaultUser /////////////////
					db.get('actions').push({ id:userId, name: "defaultUser", building: buildingId, floor: floorId, consumption: 2.2, number: 1, duration: 8 }).write();
					console.log("Caution username is defaultUser - new defaultUser created!");
				}
				return true;
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
					case 1: // Username: Search the username and change it
						if(value && value !== "" && typeof value === 'string' )
						{
							db.get('actions').find({ name: userName, building: buildingId , floor: floorId}).assign({ name: value }).write();
							console.log("Username has been changed! The new username is: " + value);
						}
						else {
							console.log("The username value is not a string and because of that cant be changed!");
						}
						break;
					case 2: // Building: Search the building and change it
						if( !isNaN(value) )
						{
							db.get('actions').find({ name: userName, building: buildingId , floor: floorId}).assign({ building: value }).write();
							console.log("Building has been changed! The new building is: " + value);
						}
						else
						{
							console.log("The building value is not a valid number and because of that cant be changed!");
						}
						break;
					case 3: // Floor: Search the floor and change it
						if( !isNaN(value) )
						{
							db.get('actions').find({ name: userName, building: buildingId , floor: floorId}).assign({ floor: value }).write();
							console.log("Floor has been changed! The new floor is: " + value);
						}
						else
						{
							console.log("The floor value is not a valid number and because of that cant be changed!");
						}
						break;
					case 4: // Consumption: Search the consumption, get the value and adds the new value and sets the sum to the new value
						if( !isNaN(value) )
						{
							var conId = db.get('actions').filter({ name: userName, building: buildingId , floor: floorId}).map('consumption').value();
							conId = parseFloat(conId);
							var conSum = 0;
							conSum = conId + value;
							conSum = conSum.toFixed(2);
							
							db.get('actions').find({ name: userName, building: buildingId , floor: floorId}).assign({ consumption: conSum }).write();
							console.log("Consumption has been changed! The new value is now: " + conSum);
						}
						else
						{
							console.log("The consumption value is not a valid number and because of that cant be changed!");
						}
						break;
					case 5: // Number: Search the number, get the value and adds the new value and sets the sum to the new value
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
					case 6: // Duration: Search the duration, get the value and adds the new value and sets the sum to the new value
						if( !isNaN(value) )
						{
							var durId = db.get('actions').filter({ name: userName, building: buildingId , floor: floorId}).map('duration').value();
							durId = parseInt(durId);
							var durSum = 0;
							durSum = durId + value;
							durSum = durSum.toFixed(2);
							
							db.get('actions').find({ name: userName, building: buildingId , floor: floorId}).assign({ duration: durSum }).write();
							console.log("Duration has been changed! The new duration is now: " + durSum);
						}
						else
						{
							console.log("The duration value is not a valid number and because of that cant be changed!");
						}
						break;
					default: // Default
						console.log(userName + " exists but the field value was wrong! Nothing has been changed!");
						break;
				}
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
			console.log("----- USER DATABASE -----");
			var check = addUser(userName, building, floor);
			if(check == false)
			{
				console.log("User has been updated!");
				changeData(userName, building, floor, 4, 2.2); // Updates consumption
				changeData(userName, building, floor, 5, 1);   // Updates pickup number
				changeData(userName, building, floor, 6, 8);   // Updates duration
			}
		}
		
		/*
		** This function updates all tables of the angular database which needs to know the username
		*/
		function updateAngular()
		{
			console.log("\n-----<Angular> USER SPECIFIC DATABASE-----");;
			//////////////////////////////////////////////// Some temporarry variables //////////////////////////////////////////////////////////
			var numberEntries =  db.get('actions').size().value(); // Counts the users
			var coffeeKingName1 = '', coffeeKingConsum1 = 0, coffeeKingName2 = '', coffeeKingConsum2 = 0, coffeeKingName3 = '', coffeeKingConsum3 = 0;
			/////////////////////////////////////////////// Goes through every persons data and sums the data up ////////////////////////////////
			// Here we determine the coffee king
			for( var i = 0; i <= numberEntries; i++)
			{
				var building = db.get('actions').filter({ id: i }).map('building').value();
				building = parseInt(building);
				var floor = db.get('actions').filter({ id: i }).map('floor').value();
				floor = parseInt(floor);
				var consumption = db.get('actions').filter({ id: i }).map('consumption').value();
				consumption = parseFloat(consumption);
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
			}
			/////////////////////////////////////// Sets data into the json file  /////////////////////////////////////////////
			dbCoffee.set( 'coffeeChefKing.name1' , coffeeKingName1 ).write();
			dbCoffee.set( 'coffeeChefKing.consumption1' , coffeeKingConsum1 ).write();
			dbCoffee.set( 'coffeeChefKing.name2' , coffeeKingName2 ).write();
			dbCoffee.set( 'coffeeChefKing.consumption2' , coffeeKingConsum2 ).write();
			dbCoffee.set( 'coffeeChefKing.name3' , coffeeKingName3 ).write();
			dbCoffee.set( 'coffeeChefKing.consumption3' , coffeeKingConsum3 ).write();

			dbCoffee.set ('coffeeBrewerPos1', "Maik"); // Default data -> not integrated yet
			dbCoffee.set ('coffeeBrewerPos2', "Josch");
			dbCoffee.set ('coffeeBrewerPos3', "Julian");
			dbCoffee.set ('coffeeBrewerPos4', "Marko");
			dbCoffee.set ('coffeeBrewerPos5', "Marina");
			dbCoffee.set ('coffeeBrewerPos6', "Konstantin");
			dbCoffee.set ('coffeeBrewerPos7', "Florian");
			dbCoffee.set ('coffeeBrewerPos8', "Leon");
			dbCoffee.set ('coffeeBrewerPos9', "Daniel");
			dbCoffee.set ('coffeeBrewerPos10', "Tyron");

			console.log("Angular user database has been refreshed!")
		}

		//////////////////////// Here it receives the client-message and takes action //////////////////////////////////////
		var mes = server.unmaskMessage(data);
		var str = server.convertToString(mes.message);  // Get the client-message and convert it to a string
		
		// Here it checks the message for spicific content -> client messages are similary to csv
		if(str.indexOf("true") < 0 && str.indexOf("false") < 0)
		{
			/////////////////////// Client message to enter to the database ///////////////////////////////////////////////////
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
			
			updateUser(name,building,floor); // Here it updates the user database
			updateAngular(); // Here it updates the user specific angular database entries
		}  
		else if(str.indexOf("true") >= 0 || str.indexOf("false") >= 0) 
		{	
			/////////////////////// Client message to prevent re-access to pick-up the pot /////////////////////////////////
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
			dbCoffee.set( 'pot.building' + msg.building + 'floor' + msg.floor, false ).write();
    	});
		
		client.subscribe({ type: DATABASE_UPDATE_NOTIFICATION_EVENT }, function(msg) 
		{ 
			console.log("<Database> Automatically database update!");
        	automaticAngularUpdate(msg.buildingId, msg.potId);
    	});
		
	 }); // Event Handler
	 
}; // Module

function formatDate(date) {
	var monthNames = [ "Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember" ];

	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();

	a = new Date();
	b = a.getHours(); c = a.getMinutes(); d = a.getSeconds();
	if(b < 10){b = '0'+b;} 
	if(c < 10){c = '0'+c;} 
	if(d < 10){d = '0'+d;}
	zeit = b+':'+c;

  	return zeit + " Uhr am " + day + '.' + monthNames[monthIndex] + ' ' + year;
}

function currentDate(date) {
	var monthNames = [ "Januar", "Februar", "M\u00e4rz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

	var day = date.getDate();
	var monthIndex = date.getMonth();
	var year = date.getFullYear();

  	return day + '.' + monthNames[monthIndex] + ' ' + year;
}