var low = require('lowdb');
const db = low('coffeeDatabase.json');
 
userId = 0;
userDef = 'user' + userId;

/////////////////////// Setting the default user to the database {neccessary} ///////////////////////
db.defaults({ userDef: {}, actions: []  }).write();
// db.get('action').push({ id:1, name: 'Leon', building: 3, floor: 1, consumption: 10, number: 1, duration: 8 }).write();
// Set a username
db.set( 'user.name' , 'username' ).write();
// Set a building
db.set( 'user.building' , 'building of the user' ).write();
// Set a floor
db.set( 'user.floor' , 'floor of the building' ).write();

		
/*
** This function checks if the user already exists and if not it creates a new user
*/
function addUser(userName, buildingId, floorId, consumptionId, numberId, durationId)
{
	temp = "'" + userName + "'" 
	userId++;
	userDef = 'user' + userId;
	
	var check = db.get('actions').map('name').value();
	console.log("Compare: " + temp + " with " + check);
	
	if(check.indexOf(userName) != -1)
	{
		console.log("User already exists!");
	}
	else
	{
		/////////////////////// Setting a new user to the database ///////////////////////
		db.defaults({ userDef: {}, actions: []  }).write();
		// Set an id
		db.set( 'user' + userId + '.id' , userId ).write();
		// Set a username
		db.set( 'user' + userId + '.name' , userName ).write();
		// Set a building
		db.set( 'user' + userId + '.building' , buildingId ).write();
		// Set a floor
		db.set( 'user' + userId + '.floor' , floorId ).write();
		db.get('actions').push({ id:userId, name: userName, building: buildingId, floor: floorId, consumption: consumptionId, number: numberId, duration: durationId }).write();
		console.log("New user created!");
	}
}

/*
** This function checks if the user exists and if he does it changes the data of it`s post7
** username -> name of the user; fiels -> index of the field which wants to be changed (number); value -> the new value of the field (number or string)
*/
function changeData(userName,field,value)
{
	var check = db.get('actions').map('name').value();
	
	// checks if exists
	if(check.indexOf(userName) != -1)
	{
		switch(field) {
			case 1: // Username
				if(value && value !== "" && typeof value === 'string' )
				{
					// Search the username and change it
					db.get('actions').find({ name: userName }).assign({ name: value }).write();
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
					db.get('actions').find({ name: userName }).assign({ building: value }).write();
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
					db.get('actions').find({ name: userName }).assign({ floor: value }).write();
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
					var conId = db.get('actions').filter({ name: userName }).map('consumption').value();
					conId = parseInt(conId);
					var conSum = 0;
					conSum = conId + value;
					
					db.get('actions').find({ name: userName }).assign({ consumption: conSum }).write();
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
					var numId = db.get('actions').filter({ name: userName }).map('number').value();
					numId = parseInt(numId);
					console.log("Data: " + numId);
					var numSum = 0;
					numSum = numId + value;
					console.log(" " + value + " " + numSum);
					
					
					db.get('actions').find({ name: userName }).assign({ number: numSum }).write();
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
					var durId = db.get('actions').filter({ name: userName }).map('duration').value();
					durId = parseInt(durId);
					var durSum = 0;
					durSum = durId + value;
					
					db.get('actions').find({ name: userName }).assign({ duration: durSum }).write();
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
		
		console.log("The data of " + userName + " has been updated!");
	
	}
	else
	{
		console.log("The username is not available. Please check your data!");
	}
}

/*
** This function returns the desired value
** userName -> name of the user; field -> 1-6 which value to return
*/
function returnData(userName,field)
{
	switch(field) {
		case 1:
			if( !isNaN(field) )
			{
				var name = db.get('actions').filter({ name: userName }).map('username').value();
				return name;
			}
			else {
				console.log("Error in username! The field is not a number.");
			}
			console.log("Username returned!");
			break;
		case 2:
			if( !isNaN(field) )
			{
				var building = db.get('actions').filter({ name: userName }).map('building').value();
				building = parseInt(building);
				return building;
			}
			else {
				console.log("Error in building! The field is not a number.");
			}
			console.log("Username returned!");
			break;
		case 3:
			if( !isNaN(field) )
			{
				var floor = db.get('actions').filter({ name: userName }).map('floor').value();
				floor = parseInt(floor);
				return floor;
			}
			else {
				console.log("Error in floor! The field is not a number.");
			}
			console.log("Username returned!");
			break;
		case 4:
			if( !isNaN(field) )
			{
				var consumption = db.get('actions').filter({ name: userName }).map('consumption').value();
				consumption = parseInt(consumption);
				return consumption;
			}
			else {
				console.log("Error in consumption! The field is not a number.");
			}
			console.log("Username returned!");
			break;
		case 5:
			if( !isNaN(field) )
			{
				var number = db.get('actions').filter({ name: userName }).map('number').value();
				number = parseInt(number);
				return number;
			}
			else {
				console.log("Error in number! The field is not a number.");
			}
			console.log("Username returned!");
			break;
		case 6:
			if( !isNaN(field) )
			{
				var duration = db.get('actions').filter({ name: userName }).map('duration').value();
				duration = parseInt(duration);
				return duration;
			}
			else {
				console.log("Error in duration! The field is not a number.");
			}
			console.log("Username returned!");
			break;
		default:
			console.log("No valid field selected. Please check your input data!");
			break;
	}
}









