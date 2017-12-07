const moment = require('moment');

var MongoClient = require('mongodb').MongoClient;
var dbURL = 'mongodb://chapterthree:ChapterThree123$@ds119486.mlab.com:19486/chapterthree';
var ObjectId = require('mongodb').ObjectID;
var db;
var TelegramBot = require('node-telegram-bot-api');
var promise = require('promise');

MongoClient.connect(dbURL, (err, database) => {
	if (err) return console.log('Error!');
	db = database;
	return console.log('Connected to database!')
});

// HEROKU LIVE 
/*
const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const options = { webHook: { port: process.env.PORT }};
const url = process.env.APP_URL; // 'https://<app-name>.herokuapp.com:443';
var telegram = new TelegramBot(TOKEN, options);
telegram.setWebHook(`${url}${TOKEN}`);
*/

//LOCAL TESTING
var telegram = new TelegramBot('460749659:AAEk1s8RpxaMDJv44zC3C2ZFUxH7U4MtYJk', { polling: true });
console.log('OPERATING LOCALLY.')


//TIMESTAMP FUNCTION

function getTimeStamp(message) {

	var timestamp = { userid: message.from.id, 
					userfirst: message.from.first_name, 
					userlast: message.from.last_name, 
					username: message.from.username,
					messagetext: message.text,
					chatid: message.chat.id,
					chatname: message.chat.title,
					date: message.date };
	console.log('TIMESTAMP: \n');
	console.log(JSON.stringify(timestamp));
	console.log('\n');			
	db.collection("allrequests").insertOne(timestamp);	
};



// /DAY - VIEW ALL TARGETS IN NEXT 24 HOURS

telegram.on("text", (message) => {
  if(message.text.toLowerCase().indexOf('/day') === 0){
  	getTimeStamp(message);
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
		currentResult = new moment.utc(result[i].blockadeEnd);
		allResults = allResults.concat('Target ' + x + ': ' + result[i].target + ' @ ' + currentResult.format('MMMM Do YYYY, HH:mm:ss') + ' UTC \n');
		x = x + 1;
		};
	telegram.sendMessage(message.chat.id, allResults)
	.then( prevmsg => {
	console.log('pin test')
	console.log(JSON.stringify(prevmsg));
	telegram.pinChatMessage(prevmsg.chat.id, prevmsg.message_id, {disable_notification: true})
		});
  })
}});


// /INSTRUCTIONS - VIEW INSTRUCTIONS FOR BOT

telegram.on("text", (message) => {
	if(message.text.toLowerCase().indexOf('/help') === 0){
  		getTimeStamp(message);
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


// VIEW ALL TARGETS

telegram.on("text", (message) => {

  if(message.text.toLowerCase().indexOf('/all') === 0){

  	getTimeStamp(message);
  	var currentDate = moment.utc(new Date).format();
  	console.log(currentDate);
  	db.collection('targets').find({ 'blockadeEnd' : { $gte : currentDate}}).sort({blockadeEnd: 1}).toArray((err, result) => {
	if (err) return console.log(err);
	console.log(result);
	var allResults = 'All targets after ' + currentDate + ': \n \n';
	var x = 1
	for (i in result) {
		currentResult = new moment.utc(result[i].blockadeEnd);
		allResults = allResults.concat('Target ' + x + ': ' + result[i].target + ' @ ' + currentResult.format('MMMM Do YYYY, HH:mm:ss') + ' UTC \n');
		x = x + 1;
		};
	telegram.sendMessage(message.chat.id, allResults);

	})}});


// VIEW ALL TARGETS WITH IDS

telegram.on("text", (message) => {

  if(message.text.toLowerCase().indexOf('/id') === 0){
  	getTimeStamp(message);
  	var currentDate = moment.utc(new Date).format();
  	console.log(currentDate);
  	db.collection('targets').find({ 'blockadeEnd' : { $gte : currentDate}}).sort({blockadeEnd: 1}).toArray((err, result) => {
		if (err) return console.log(err);
		console.log(result);

		for (i in result) {
			telegram.sendMessage(message.chat.id, result[i].target + " " + result[i]._id);
			};


/*
		var allResults = 'All targets after ' + currentDate + ': \n \n';
		var x = 1
		for (i in result) {
			allResults = allResults.concat('Target ' + x + ': ' + result[i].target + ' @ ' + result[i].blockadeEnd + ' //  ' + result[i]._id + '\n');
			x = x + 1;
			};
		telegram.sendMessage(message.chat.id, allResults);
*/



/* callback version, but the messages are out of order

		function sendTop(sendBottom) {
			telegram.sendMessage(message.chat.id, result[i].target + ' @ ' + result[i].blockadeEnd + '\n')
			sendBottom();
			};
			
		function sendBottom() {
			telegram.sendMessage(message.chat.id, result[i].target + result[i]._id + '\n');
			};

		function sendIDs(sendTop, sendBottom) {
			sendTop(sendBottom);
			};

		for (i in result) {
			sendTop(sendBottom);
			};
*/
		
	  })
}});

//ADD A TARGET + VERIFICATION

telegram.on("text", (message) => {
	if(message.text.toLowerCase().indexOf('/add') === 0) {

  	getTimeStamp(message);
	
		var confirmation = 0;
		var userID = message.from.id;
		console.log(userID);

		db.collection('admins').find({}, {adminID: true}).toArray((err, result) => {
			if (err) return console.log(err);
			console.log(JSON.stringify(result));
			
			for (i in result) {
				if ( userID == result[i].adminID) {
					confirmation = 1 
				}
			};

			if (confirmation == 0 ) {
						telegram.sendMessage(message.chat.id, 'You don\'t have permission to add targets to NukeBot.');
					} else {
				
				// START OF ADD TARGET CODE
			
				var params = message.text.split(" "); // split out the input
				console.log(params);
				
				var activeUser = message.from.username;
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
	
				var newTarget = { user: activeUser, target: target, nukes: nukes, blockadeStart: startDate.format(), blockadeEnd:  endDate.format() };
 
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
	})}
});





// /DELETE - DELETE A TARGET USING ID

telegram.on("text", (message) => {
	if(message.text.toLowerCase().indexOf('/delete') === 0) {

		getTimeStamp(message);

		var confirmation = 0;
		var userID = message.from.id;
		console.log(userID);

		db.collection('admins').find({}, {adminID: true}).toArray((err, result) => {
			if (err) return console.log(err);
			console.log(JSON.stringify(result));
		
			for (i in result) {
				if ( userID == result[i].adminID) {
					confirmation = 1 
				}
			};
			
			if (confirmation == 0 ) {
						telegram.sendMessage(message.chat.id, 'You don\'t have permission to delete targets to NukeBot.');
					} else {
					
		//START OF DELETE CODE
		
		var params = message.text.split(" "); 	// split out the input
		console.log(params);

		toDeleteStr = params[1];
		
// use the below if it gets hung up
//5a24cba8567e1773d2f4e101
//		var toDelete = { _id: ObjectId('5a24cba8567e1773d2f4e101') };

		console.log('target to delete:' + toDeleteStr);

		if (params.length != 2 ) {
					telegram.sendMessage(message.chat.id, '*Invalid entry!* Please enter ONLY the ID.', { parse_mode: "Markdown"});
				} else { 
					var toDelete = { _id: ObjectId(params[1]) };	// define target ID to delete
					db.collection("targets").deleteOne(toDelete, function(err, res) {
						if (err) throw err;
						console.log("1 document deleted");
						});
						telegram.sendMessage(message.chat.id, 'Target deleted: ' + params[1]);
						};
					}
		})}});

//GET CURRENT UTC TIMESTAMP

telegram.on("text", (message) => {
	
	if(message.text.toLowerCase().indexOf('/current') === 0) {
  	getTimeStamp(message);
    var params = message.text.split(" "); 	// split out the input
  	console.log(params);
  	
  	var currentDate = new moment.utc()
  	console.log(currentDate);

	if (params.length != 1 ) {
  				telegram.sendMessage(message.chat.id, '*Invalid entry!* Please use only the command.', { parse_mode: "Markdown"});
  			} else {
					telegram.sendMessage(message.chat.id, currentDate.format('MMMM Do YYYY, HH:mm:ss') + ' UTC')
//					.then( prevmsg => {
//					console.log('pin test')
//  					console.log(JSON.stringify(prevmsg));
//						telegram.pinChatMessage(prevmsg.chat.id, prevmsg.message_id, {disable_notification: true})
//					};
				};
	}
});

// GTFO TEST

telegram.on("text", (message) => {

	if(message.text.toLowerCase().indexOf('/gtfo') === 0) {
  	getTimeStamp(message);
	if ( message.chat.id != 10 ) {
	telegram.sendMessage(message.chat.id, 'see ya sucker!');
	telegram.leaveChat(message.chat.id);}
	else {
  
    var params = message.text.split(" "); 	// split out the input
  	console.log(params);
  	
  	var currentDate = new moment.utc()
  	console.log(currentDate);

	if (params.length != 1 ) {
  				telegram.sendMessage(message.chat.id, '*Invalid entry!* Please use only the command.', { parse_mode: "Markdown"});
  			} else {
					telegram.sendMessage(message.chat.id, currentDate.format())
					.then( prevmsg => {
  					console.log('pin test')
  					console.log(JSON.stringify(prevmsg));
						telegram.pinChatMessage(prevmsg.chat.id, prevmsg.message_id, {disable_notification: true})
					});
					};
	}}}
);

//GET USER ID
telegram.on("text", (message) => {
	if(message.text.toLowerCase().indexOf('/myid') === 0) {
  
  	getTimeStamp(message);
    var params = message.text.split(" "); 	// split out the input
  	console.log(params);
  	
  	var currentDate = new moment.utc()
  	console.log(currentDate);

	if (params.length != 1 ) {
  				telegram.sendMessage(message.chat.id, 'It\'s pretty hard to mess this up.', { parse_mode: "Markdown"});
  			} else {
					telegram.sendMessage(message.chat.id, 'User ID for ' + message.from.username + ' is ' + message.from.id);
					};
	}
});

//ADD USER ID TO ADMIN LIST
telegram.on("text", (message) => {

	if(message.text.toLowerCase().indexOf('/adminadd') === 0) {
  	getTimeStamp(message);
    var params = message.text.split(" "); 	// split out the input
  	console.log(params);
  	
  	var newAdminName = params[1]
  	var newAdminID = params[2];

	var dbAdmin = { 'adminName' : newAdminName, 'adminID' : newAdminID };

	db.collection("admins").insertOne(dbAdmin, function(err, res) {
						if (err) throw err;
						console.log("1 document inserted");
						telegram.sendMessage(message.chat.id, 'New admin added! \n' + 'Name: ' + newAdminName + '\n' + 'Telegram ID: ' + newAdminID );
						});
	}
});


//SHOW ALL ADMINS
telegram.on("text", (message) => {

	if(message.text.toLowerCase().indexOf('/adminall') === 0) {
  	getTimeStamp(message);
  	db.collection('admins').find({}).toArray((err, result) => {
		if (err) return console.log(err);
		console.log('RESULTS: \n' + JSON.stringify(result));
		var allResults = 'All admins below: \n \n';
		var x = 1
		for (i in result) {
			currentAdminName = result[i].adminName;
			currentAdminID = result[i].adminID;
			allResults = allResults.concat('Name: ' + currentAdminName + ' // ' + 'ID: ' + currentAdminID + '\n');
			x = x + 1;
		};
	telegram.sendMessage(message.chat.id, allResults);
	})
}});




//VERIFY - SEE IF YOU HAVE ACCESS TO BOT
telegram.on("text", (message) => {

	if(message.text.toLowerCase().indexOf('/verify') === 0) {
  	getTimeStamp(message);
	var confirmation = 0;
  	var userID = message.from.id;
	console.log(userID);
	console.log(JSON.stringify(message));

  	db.collection('admins').find({}, {adminID: true}).toArray((err, result) => {
		if (err) return console.log(err);
		console.log(JSON.stringify(result));
			
		for (i in result) {
			if ( userID == result[i].adminID) {
				confirmation = 1 
			}
		};

		if (confirmation == 0 ) {
					telegram.sendMessage(message.chat.id, 'You don\'t have permission to use NukeBot.');
				} else {
					telegram.sendMessage(message.chat.id, 'You are a verified user. Go get those nukes!', { parse_mode: "Markdown"});
				};
		
		})
	}
});


//USER VERIFICATION WITH CALLBACKS - SEE IF YOU HAVE ACCESS TO BOT
telegram.on("text", (message) => {
	if(message.text.toLowerCase().indexOf('/vf') === 0) {

  	getTimeStamp(message);

  	//get ID of initiating user
  	var userID = message.from.id;
	console.log(userID);
	console.log(JSON.stringify(message));
  	
  	//compare userID against admins in database
	function verificationProcess(userID, messagingProcess) {
		db.collection('admins').find({}, {adminID: true}).toArray((err, result) => {
			if (err) return console.log(err);
			console.log(JSON.stringify(result));
			for (i in result) {
				if ( userID == result[i].adminID) {
					console.log( '\n CHECKING \n' + userID + ' === ' + result[i].adminID +'\n \n')
					confirmation = 1 
				};
			};
			messagingProcess(confirmation);	
		});
	};
	
	//pass confirmation result to any messaging function
	function messagingStart(confirmation) {
		if (confirmation == 0 ) {
					telegram.sendMessage(message.chat.id, 'You don\'t have permission to use NukeBot.');
				} else {
					// this could be anything
					telegram.sendMessage(message.chat.id, 'You are a verified user. Go get those nukes!', { parse_mode: "Markdown"});
				};
		};
		
	verificationProcess(userID, messagingStart);	
	
	}
});



//ARE YOU ALIVE?

telegram.on("text", (message) => {

	if(message.text.toLowerCase().indexOf('/alive') === 0) {
	
  	getTimeStamp(message);
	
    var params = message.text.split(" "); 	// split out the input
  	console.log(params);
  	
  	var currentDate = new moment.utc()
  	console.log(currentDate);

	if (params.length != 1 ) {
  				telegram.sendMessage(message.chat.id, 'It\'s pretty hard to mess this up.', { parse_mode: "Markdown"});
  			} else {
					telegram.sendMessage(message.chat.id, 'Yes, I am alive.');
					};
	}
});

/*
// Matches /test
telegram.onText(/\/test/, function (msg) {
	var inMonths = '';
	var inDays = '';
	var inHours = '';
	var inMinutes = '';
	var finalDate = '';
	var theYear = moment().year();
	console.log(theYear);
  	const keyMonths = {
    'reply_to_message_id': msg.message_id,
    'reply_markup': { 'keyboard' : [ 
		[ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun' ],
		['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] ] },
    'one_time_keyboard': true
	};
	var addingUser = msg.from.id 	


//	var monthsChat = msg.chat.id;
//	var monthsMsgID = msg.message_id;
//	console.log(monthsChat + ' // ' + monthsMsgID);	
	
	telegram.sendMessage(msg.chat.id, 'Pick a month.', keyMonths);



	telegram.onText(/\S\S\S/, function (msg2) {
		inMonths = msg2.text;
		if (inMonths === 'Jan') { inMonths = '01'}
		else if (inMonths === 'Feb') { inMonths = '01'}
		else if (inMonths === 'Mar') { inMonths = '01'}
		else if (inMonths === 'Apr') { inMonths = '01'}
		else if (inMonths === 'May') { inMonths = '01'}
		else if (inMonths === 'Jun') { inMonths = '01'}
		else if (inMonths === 'Jul') { inMonths = '01'}
		else if (inMonths === 'Aug') { inMonths = '01'}
		else if (inMonths === 'Sep') { inMonths = '01'}
		else if (inMonths === 'Oct') { inMonths = '01'}
		else if (inMonths === 'Nov') { inMonths = '01'}
		else if (inMonths === 'Dec') { inMonths = '01'}
		else {'Invalid entry.'};	
		console.log('month: ' + inMonths);
	  	const inputDays = {
		'reply_to_message_id': msg2.message_id,
		'reply_markup': { 'keyboard' : [ 
			[ '01', '02', '03', '04', '05', '06', '07'],
			[ '08', '09', '10', '11', '12', '13', '14'],
			[ '15', '16', '17', '18', '19', '20', '21'],
			[ '22', '23', '24', '25', '26', '27', '28'],
			[ '29', '30', '31', '--', '--', '--', '--'] ] },
			'one_time_keyboard': true
			};
	
		if (msg.from.id === addingUser) {
			telegram.sendMessage(msg.chat.id, 'Pick a day.', inputDays )
			
			telegram.onText(/\d\d/, function (msg3) {
			  inDays = msg3.text;
			  console.log('days: ' +inDays);
			  const keyHours = {
				'reply_to_message_id': msg3.message_id,
				'reply_markup': { 'keyboard' : [ 
					[ '00', '01', '02', '03', '04', '05'],
					[ '06', '07', '08', '09', '10', '11'],
					[ '12', '13', '14', '15', '16', '17'],
					[ '18', '19', '20', '21', '22', '23'] ] },
					'one_time_keyboard': true
					};
	
	
			if (msg.from.id === addingUser) {
					telegram.sendMessage(msg.chat.id, 'Pick an hour.', keyHours )									
		
					telegram.onText(/\d\d/, function (msg4) {
					  inHours = msg4.text;
					  console.log('hours: ' + inHours);
					  const keyMinutes = {
						'reply_to_message_id': msg4.message_id,
						'reply_markup': { 'keyboard' : [ 
							[ '00', '05', '10', '15'],
							['20', '25', '30', '35'],
							['40', '45', '50', '55'], ] },
							'one_time_keyboard': true
							};


						if (msg.from.id === addingUser) {
								telegram.sendMessage(msg.chat.id, 'Pick a minute.', keyMinutes )
								
								telegram.onText(/\d\d/, function (msg5) {
								  inMinutes = msg5.text;
								  var finalDateString = theYear + '-' + inMonths + '-' + inDays + 'T' + inHours + ':' + inMinutes + ':' + '00';
								  console.log('minutes: ' + inMinutes);
								  console.log('final date: ' + finalDate);
								  finalDate = new moment.utc(finalDateString);
								  console.log(finalDate);

									if (msg.from.id === addingUser) {
											telegram.sendMessage(msg.chat.id, 'Your date is ' + finalDate.format() )}});
											
								}})}})}})});



/*
telegram.onText(/\/test/, function (msg) {

	telegram.sendMessage(msg.chat.id, 'pick dat month', {
        force_reply: true,
        reply_to_message_id: msg.message_id})
    .then(payload => {
    	console.log(payload.reply_to_message.text + ' /// ' + msg.text);
		if (payload.reply_to_message.message_id == msg.message_id) {
    		telegram.onText(/\d\d/, function (msg2) {
    			console.log('this should be working');
				telegram.sendMessage(msg2.chat.id, 'pick dat day', {
        			force_reply: true,
        			reply_to_message_id: msg2.message_id})

		})}})});	
		
	        
*/    
 
telegram.onText(/\/test/, function (startmsg) {

	var initUser = startmsg.from.id;
	var addArray = startmsg.text.split(" ");
	var addName = addArray[1];
	
	console.log(addName);

	var inMonths = '';
	var inDays = '';
	var inHours = '';
	var inMinutes = '';
	var finalDate = '';
	var nukes = '';
	var theYear = moment().year();

	var nukesReg = new RegExp(/N\d\d/);
	var monthReg = new RegExp(/\S\S\S\./);
	var dayReg = new RegExp(/D\d\d/);
	var hourReg = new RegExp(/H\d\d/);
	var minReg = new RegExp(/M\d\d/);
	var confirmReg = new RegExp(/\S\S\S\S\S\S/);


 	const keyNukes = {
		'reply_to_message_id': startmsg.message_id,
		'reply_markup': { 'keyboard' : [ 
			[ 'N01', 'N02', 'N03', 'N04'],
			[ 'N05', 'N06', 'N07', 'N08'], 
			[ 'N09', 'N10', 'N11', 'N12'],
			[ 'N13', 'N14', 'N15', 'N16'] ],
    		'one_time_keyboard': true,
    		'selective': true,
			}};
		
	telegram.sendMessage(startmsg.chat.id, 'How many nukes did the target have at the start of your infiltration?', keyNukes )
    .then(nukespayload => { telegram.onText(nukesReg, function (msg) {

		console.log('HELLO???');
		telegram.removeTextListener(nukesReg);

		console.log(JSON.stringify(startmsg));
		console.log(JSON.stringify(nukespayload));
		console.log(JSON.stringify(msg));
		intNukes = Number(msg.text.substring(1,3));
		console.log(intNukes);
		
		const keyMonths = {
			'reply_to_message_id': msg.message_id,
			'reply_markup': { 'keyboard' : [ 
				[ 'Jan.', 'Feb.', 'Mar.', 'Apr.'],
				[ 'May.', 'Jun.', 'Jul.', 'Aug.'], 
				[ 'Sep.', 'Oct.', 'Nov.', 'Dec.'] ],
				'one_time_keyboard': true,
				'selective': true,
				}};
			//nukespayload.id == msg.reply_to_message.id
		if ( msg.from.id == initUser ) {
		telegram.sendMessage(msg.chat.id, 'Please pick a month.', keyMonths )
		.then(payload => { telegram.onText(monthReg, function (msg2) {
	
	
			telegram.removeTextListener(monthReg);

			inMonths = msg2.text; 
			if (msg2.text === "Jan.") { inMonths = "01" }
			else if (msg2.text === "Feb.") { inMonths = "02" }
			else if (msg2.text === "Mar.") { inMonths = "03" }
			else if (msg2.text === "Apr.") { inMonths = "04" }
			else if (msg2.text === "May.") { inMonths = "05" }
			else if (msg2.text === "Jun.") { inMonths = "06" }
			else if (msg2.text === "Jul.") { inMonths = "07" }
			else if (msg2.text === "Aug.") { inMonths = "08" }
			else if (msg2.text === "Sep.") { inMonths = "09" }
			else if (msg2.text === "Oct.") { inMonths = "10" }
			else if (msg2.text === "Nov.") { inMonths = "11" }
			else if (msg2.text === "Dec.") { inMonths = "12" };
		

			const keyDays = {
			'reply_to_message_id': msg2.message_id,
			'reply_markup': { 'keyboard' : [ 
				[ 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07'],
				[ 'D08', 'D09', 'D10', 'D11', 'D12', 'D13', 'D14'],
				[ 'D15', 'D16', 'D17', 'D18', 'D19', 'D20', 'D21'],
				[ 'D22', 'D23', 'D24', 'D25', 'D26', 'D27', 'D28'],
				[ 'D29', 'D30', 'D31', '--', '--', '--', '--'] ],
				'one_time_keyboard': true,
				'selective': true,
				}};
			
			
			if ( msg2.from.id == initUser ) {
				//console.log('ask for month id: ' + payload.message_id + ' new input responding to: ' + msg2.reply_to_message.message_id);
				telegram.sendMessage(msg2.chat.id, 'Please pick a day.', keyDays )
				.then(payload2 => { 
					telegram.onText(dayReg, function (msg3) {

				telegram.removeTextListener(dayReg);
			
				inDays = msg3.text.substring(1,3);
				const keyHours = {
				'reply_to_message_id': msg3.message_id,
				'reply_markup': { 'keyboard' : [ 
					[ 'H00', 'H01', 'H02', 'H03', 'H04', 'H05'],
					[ 'H06', 'H07', 'H08', 'H09', 'H10', 'H11'],
					[ 'H12', 'H13', 'H14', 'H15', 'H16', 'H17'],
					[ 'H18', 'H19', 'H20', 'H21', 'H22', 'H23'] ],
				'one_time_keyboard': true,
				'selective': true,
				}};
			
			
				if ( msg3.from.id == initUser ) {
					//console.log('ask for days id: ' + payload2.message_id + ' new input responding to: ' + msg3.reply_to_message.message_id);
					telegram.sendMessage(msg3.chat.id, 'Please pick the hour (UTC, 24-hour clock).', keyHours )
					.then(payload3 => { 
						telegram.onText(hourReg, function (msg4) {
				
					telegram.removeTextListener(hourReg);
				
					inHours = msg4.text.substring(1,3);
					const keyMinutes = {
					'reply_to_message_id': msg4.message_id,
					'reply_markup': { 'keyboard' : [ 
						[ 'M00', 'M05', 'M10', 'M15'],
						[ 'M20', 'M25', 'M30', 'M35'],
						[ 'M40', 'M45', 'M50', 'M55'] ],
						'one_time_keyboard': true,
						'selective': true,
						}};
					
							
					if ( msg4.from.id == initUser) {
						//console.log('ask for hours id: ' + payload3.message_id + ' new input responding to: ' + msg4.reply_to_message.message_id);
						telegram.sendMessage(msg4.chat.id, 'Please pick the minutes.', keyMinutes )
						.then(payload4 => { 
							telegram.onText(minReg, function (msg5) {
					
						telegram.removeTextListener(minReg);
						inMinutes = msg5.text.substring(1,3);
						console.log('substring minutes: ' + inMinutes);
						const finalMsg = {
							'reply_to_message_id': msg5.message_id,
							'reply_markup': 
								{ 'keyboard' : [ 
									['Submit'] , 
									['Cancel'] ],  
								'one_time_keyboard': true, 
								'selective': true }
								};
				
					
						var finalDateString = theYear + '-' + inMonths + '-' + inDays + 'T' + inHours + ':' + inMinutes + ':' + '00';
					
						var blockadeDays = intNukes;
						if (intNukes >= 6) {
							blockadeDays = 6 }; 			//convert nukes to blockage length
							console.log('nukes: ' + intNukes + '\n' + 'blockade days: ' + blockadeDays);  
				

						var startDate = moment.utc(finalDateString);			//define start date
						console.log('start date: ' + startDate.format());
						var endDate = moment.utc(finalDateString);				//define end date
						endDate = moment.utc(endDate).add(blockadeDays, 'days'); //add nukes to end date
 
					
					
						if ( msg5.from.id == initUser ) {
							//console.log('last outgoing: ' + payload4.message_id + ' last incoming: ' + msg5.reply_to_message.message_id);
							telegram.sendMessage(msg5.chat.id, 'Please review the below and SUBMIT or CANCEL. \n \n' + 'Target: ' + addName + '\n' + 'Nukes: ' + intNukes + '\n' + 'Attack Date: ' + startDate.format('MMMM Do YYYY, HH:mm:ss') + ' UTC' + '\n' + 'Blockade End: ' + endDate.format('MMMM Do YYYY, HH:mm:ss') + ' UTC', finalMsg )
							.then(payload5 => { 
								telegram.onText(confirmReg, function (msg6) {


							console.log(msg6.text);
							telegram.removeTextListener(monthReg);
							telegram.removeTextListener(dayReg);
							telegram.removeTextListener(hourReg);
							telegram.removeTextListener(minReg);
							telegram.removeTextListener(confirmReg);

							const closeOut = {
								'reply_markup': {
									'remove_keyboard': true,
									'selective': true }
									};

							if (msg6.text == 'Submit') {
								telegram.sendMessage(msg6.chat.id, 'Added a new target! And how!', closeOut);
								telegram.removeTextListener(confirmReg) }
							else {telegram.sendMessage(msg6.chat.id, 'Snake, what\'s wrong? Snake?! Snaaaaake!', closeOut);
								telegram.removeTextListener(confirmReg) };
						
						
		})})}})})}})})}})})}})})}})})});	
		
		
		
