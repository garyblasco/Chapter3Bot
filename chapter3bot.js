const moment = require('moment');

var MongoClient = require('mongodb').MongoClient;
var dbURL = 'mongodb://chapterthree:ChapterThree123$@ds119486.mlab.com:19486/chapterthree';
var ObjectId = require('mongodb').ObjectID;
var db;
var TelegramBot = require('node-telegram-bot-api');

MongoClient.connect(dbURL, (err, database) => {
	if (err) return console.log('Error!');
	db = database;
	return console.log('Connected!')
});

const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const options = { webHook: { port: process.env.PORT }};
const url = process.env.APP_URL; // 'https://<app-name>.herokuapp.com:443';

var telegram = new TelegramBot(TOKEN, options);

telegram.setWebHook(`${url}${TOKEN}`);


/* view upcoming -- deprecated

telegram.on("text", (message) => {
	currentDate = moment.utc(new Date).format();
  	console.log(currentDate);
  	if(message.text.toLowerCase().indexOf('/upcoming') === 0){
  		db.collection('targets').find({ 'blockadeEnd' : { $gte : currentDate}}).sort({blockadeEnd: 1}).limit(3).sort({blockadeEnd: 1}).toArray((err, result) => {
		if (err) return console.log(err);
		console.log(result);
		var allResults = 'The next three targets: \n \n';
		var x = 1
		for (i in result) {
			allResults = allResults.concat('Target ' + x + ': ' + result[i].target + ' @ ' + result[i].blockadeEnd + ' UTC \n');
			x = x + 1;
			};
		telegram.sendMessage(message.chat.id, allResults);
		
		//telegram.sendMessage(message.chat.id, 'Target 1: ' + result[0].target + ' @ ' + result[0].blockadeEnd + '\n' + 'Target 2: ' + result[1].target + ' @ ' + result[1].blockadeEnd + '\n' + 'Target 3: ' + result[2].target + ' @ ' + result[2].blockadeEnd);
		});
  }
});
*/

// view all in next 24 hours

telegram.on("text", (message) => {
  if(message.text.toLowerCase().indexOf('/day') === 0){
  	var currentDate = new moment.utc();
  	var nextDay = new moment.utc();
  	nextDay = nextDay.add(1, 'day');
  	console.log('current:' + currentDate.format());
  	console.log('plus 1:' + nextDay.format());
  	db.collection('targets').find({ 'blockadeEnd' : { $gte : currentDate.format(), $lte : nextDay.format()}}).sort({blockadeEnd: 1}).toArray((err, result) => {
	if (err) return console.log(err);
	console.log(result);
	var allResults = 'All targets in the next 24 hours: \n \n';
	var x = 1
	for (i in result) {
		allResults = allResults.concat('Target ' + x + ': ' + result[i].target + ' @ ' + result[i].blockadeEnd + ' UTC \n');
		x = x + 1;
		};
	telegram.sendMessage(message.chat.id, allResults);
		});
  }
});


// view instructions

telegram.on("text", (message) => {
	if(message.text.toLowerCase().indexOf('/help') === 0){
		telegram.sendMessage(message.chat.id, 
			'*INSTRUCTIONS FOR NUKEBOT!* \n \n'
			+ 'To *ADD* a target, type the following command: \n \n'
			+ '*/add (target) (# of nukes) (date/time)* \n \n'
			+ 'Example command: \n \n'
			+ '*/add RefohWidel 5 2017-11-30T16:55:00* \n \n'
			+ '- *(target)* should be a PSN name, like RefohWidel \n'
			+ '- *(# of nukes)* should be a number, 1, 2, 3, etc. \n'
			+ '- Use the number of nukes BEFORE your infiltration \n'
			+ '- *(date/time) MUST* be entered in a specific format: \n'
			+ '\t *YYYY-MM-DDTHH:MM:SS* \n'
			+ '- Don\'t forget the *T* between the date and time!\n'
			+ '- The TIME should always use a 24-hour clock. \n'
			+ '- Examples: 2017-11-30T13:15:00, 2017-12-30T16:30:00 \n \n'
			+ 'To view entries, use the following: \n \n'
			+ '*/all* will display ALL upcoming targets \n'
			+ '*/day* will display all targets in the next 24 hours' , 
			{parse_mode: "Markdown"});
  }
});


// view all after current

telegram.on("text", (message) => {
  if(message.text.toLowerCase().indexOf('/all') === 0){
  	var currentDate = moment.utc(new Date).format();
  	console.log(currentDate);
  	db.collection('targets').find({ 'blockadeEnd' : { $gte : currentDate}}).sort({blockadeEnd: 1}).toArray((err, result) => {
	if (err) return console.log(err);
	console.log(result);
	var allResults = 'All targets after ' + currentDate + ': \n \n';
	var x = 1
	for (i in result) {
		allResults = allResults.concat('Target ' + x + ': ' + result[i].target + ' @ ' + result[i].blockadeEnd + ' UTC \n');
		x = x + 1;
		};
	telegram.sendMessage(message.chat.id, allResults);
		});
  }
});


// view all after current with IDs

telegram.on("text", (message) => {
  if(message.text.toLowerCase().indexOf('/id') === 0){
  	var currentDate = moment.utc(new Date).format();
  	console.log(currentDate);
  	db.collection('targets').find({ 'blockadeEnd' : { $gte : currentDate}}).sort({blockadeEnd: 1}).toArray((err, result) => {
	if (err) return console.log(err);
	console.log(result);
	var allResults = 'All targets after ' + currentDate + ': \n \n';
	var x = 1
	for (i in result) {
		allResults = allResults.concat('Target ' + x + ': ' + result[i].target + ' @ ' + result[i].blockadeEnd + ' ' + result[i]._id + '\n');
		x = x + 1;
		};
	telegram.sendMessage(message.chat.id, allResults);
		});
  }
});

// add a target

telegram.on("text", (message) => {
  if(message.text.toLowerCase().indexOf('/add') === 0) {
  
  	var params = message.text.split(" "); // split out the input
  	console.log(params);
  	
  	var target = params[1];				// define target
  	console.log('target:' + target);
  	var nukes = Number(params[2]);		//convert nuke str to int
  	console.log(nukes);
	var blockadeDays = nukes;
	if (blockadeDays >= 6) {
		blockadeDays = 6 }; 			//convert nukes to blockage length
	console.log('blockade days: ' + blockadeDays);  	


  	var startDate = moment.utc(params[3]);		//define start date
  	console.log('start date: ' + startDate.format());
  	var endDate = moment.utc(params[3]);		//define end date
	endDate = moment.utc(endDate).add(blockadeDays, 'days'); //add nukes to end date
 
 	//create json object for database
 	
   	var newTarget = { target: target, nukes: nukes, blockadeStart: startDate.format(), blockadeEnd:  endDate.format() };
 
 	//test for bad date
 	
  		if(startDate.isValid() === false ) {
  			telegram.sendMessage(message.chat.id, '*Invalid date!* Please try again.', { parse_mode: "Markdown"});
  			} else if (isNaN(nukes) === true ) {
  				telegram.sendMessage(message.chat.id, '*Invalid entry!* Please enter a number of nukes (1 to 16).', { parse_mode: "Markdown"});
  			} else if (params.length != 4 ) {
  				telegram.sendMessage(message.chat.id, '*Invalid entry!* Please try again using: /add (target) (# of nukes) (YYYY-MM-DDTHH:MM:SS)', { parse_mode: "Markdown"});
  			} else {
					db.collection("targets").insertOne(newTarget, function(err, res) {
						if (err) throw err;
						console.log("1 document inserted");
						});
						telegram.sendMessage(message.chat.id, 'New Target Added: ' + target + ' @ ' + endDate.format());
				};
	}
});




// delete a target

telegram.on("text", (message) => {
	if(message.text.toLowerCase().indexOf('/delete') === 0) {
  
  	var params = message.text.split(" "); 	// split out the input
  	console.log(params);

  	toDeleteStr = params[1];
  	var toDelete = { _id: ObjectId(params[1]) };				// define target ID to delete
  	console.log('target to delete:' + toDelete);
 	
	if (params.length != 2 ) {
  				telegram.sendMessage(message.chat.id, '*Invalid entry!* Please enter ONLY the ID.', { parse_mode: "Markdown"});
  			} else {
				db.collection("targets").deleteOne(toDelete, function(err, res) {
					if (err) throw err;
					console.log("1 document inserted");
					});
					telegram.sendMessage(message.chat.id, 'Target deleted: ' + params[1]);
					};
	}
});


// get current UTC

telegram.on("text", (message) => {
	if(message.text.toLowerCase().indexOf('/current') === 0) {
  
    var params = message.text.split(" "); 	// split out the input
  	console.log(params);
  	
  	var currentDate = new moment.utc()
  	console.log(currentDate);

	if (params.length != 1 ) {
  				telegram.sendMessage(message.chat.id, '*Invalid entry!* Please use only the command.', { parse_mode: "Markdown"});
  			} else {
					telegram.sendMessage(message.chat.id, currentDate.format());
					};
	}
});

// Matches /test
telegram.onText(/\/test/, function test(msg) {
  const inputMonths = {
    reply_to_message_id: msg.message_id,
    reply_markup: JSON.stringify({
      keyboard: [
        ['Jan'],
        ['Feb'],
        ['Mar'],
        ['Apr'],
        ['May'],
        ['Jun'],
        ['Jul'],
        ['Aug'],
        ['Sep'],
        ['Oct'],
        ['Nov'],
        ['Dec']
      ]
    })
  };
  telegram.sendMessage(msg.chat.id, 'Pick a month.', inputMonths);
  
});