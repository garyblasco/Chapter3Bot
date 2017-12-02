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
	return console.log('Connected!')
});

/* HEROKU */
const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const options = { webHook: { port: process.env.PORT }};
const url = process.env.APP_URL; // 'https://<app-name>.herokuapp.com:443';
var telegram = new TelegramBot(TOKEN, options);
telegram.setWebHook(`${url}${TOKEN}`);
*/

//LOCAL TESTING
//var telegram = new TelegramBot('460749659:AAEk1s8RpxaMDJv44zC3C2ZFUxH7U4MtYJk', { polling: true });



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

telegram.on("text", (message) => {
	if(message.text.toLowerCase().indexOf('/alive') === 0) {
  
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
 
telegram.onText(/\/test/, function (msg) {

	var inMonths = '';
	var inDays = '';
	var inHours = '';
	var inMinutes = '';
	var finalDate = '';
	var theYear = moment().year();


  	const keyMonths = {
		'reply_to_message_id': msg.message_id,
		'reply_markup': { 'keyboard' : [ 
			[ 'Jan.', 'Feb ', 'Mar ', 'Apr ', 'May ', 'Jun ' ],
			['Jul ', 'Aug ', 'Sep ', 'Oct ', 'Nov ', 'Dec '] ] },
    		'one_time_keyboard': true
			};
			
		
	var monthReg = new RegExp(/\S\S\S\./);
	var dayReg = new RegExp(/D\d\d/);
	var hourReg = new RegExp(/H\d\d/);
	var minReg = new RegExp(/M\d\d/);
	var confirmReg = new RegExp(/\S\S\S\S\S\S/);
		
	telegram.sendMessage(msg.chat.id, 'Please pick a month.', keyMonths )
    .then(payload => { telegram.onText(monthReg, function (msg2) {
    
    	inMonths = msg2.text; 
    	const keyDays = {
		'reply_to_message_id': msg2.message_id,
		'reply_markup': { 'keyboard' : [ 
			[ 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07'],
			[ 'D08', 'D09', 'D10', 'D11', 'D12', 'D13', 'D14'],
			[ 'D15', 'D16', 'D17', 'D18', 'D19', 'D20', 'D21'],
			[ 'D22', 'D23', 'D24', 'D25', 'D26', 'D27', 'D28'],
			[ 'D29', 'D30', 'D31', '--', '--', '--', '--'] ] },
			'one_time_keyboard': true
			};
			
    	if ( payload.id == msg2.reply_to_message.id ) {
    		console.log('ask for month id: ' + payload.message_id + ' new input responding to: ' + msg2.reply_to_message.message_id);
			telegram.sendMessage(msg2.chat.id, 'Please pick a day.', keyDays )
			.then(payload2 => { 
				telegram.onText(dayReg, function (msg3) {

			inDays = msg3.text;
			const keyHours = {
			'reply_to_message_id': msg3.message_id,
			'reply_markup': { 'keyboard' : [ 
				[ 'H00', 'H01', 'H02', 'H03', 'H04', 'H05'],
				[ 'H06', 'H07', 'H08', 'H09', 'H10', 'H11'],
				[ 'H12', 'H13', 'H14', 'H15', 'H16', 'H17'],
				[ 'H18', 'H19', 'H20', 'H21', 'H22', 'H23'] ] },
				'one_time_keyboard': true
				};
			
    		if ( payload2.id == msg3.reply_to_message.id ) {
    			console.log('ask for days id: ' + payload2.message_id + ' new input responding to: ' + msg3.reply_to_message.message_id);
				telegram.sendMessage(msg3.chat.id, 'Please pick the hour (UTC, 24-hour clock).', keyHours )
				.then(payload3 => { 
					telegram.onText(hourReg, function (msg4) {
				
				inHours = msg4.text;
				const keyMinutes = {
				'reply_to_message_id': msg4.message_id,
				'reply_markup': { 'keyboard' : [ 
					[ 'M00', 'M05', 'M10', 'M15'],
					[ 'M20', 'M25', 'M30', 'M35'],
					[ 'M40', 'M45', 'M50', 'M55'], ] },
					};
					
							
				if ( payload3.id == msg4.reply_to_message.id ) {
    				console.log('ask for hours id: ' + payload3.message_id + ' new input responding to: ' + msg4.reply_to_message.message_id);
					telegram.sendMessage(msg4.chat.id, 'Please pick the minutes.', keyMinutes )
					.then(payload4 => { 
						telegram.onText(minReg, function (msg5) {
					
					inMinutes = msg5.text;
					const finalMsg = {
						'reply_to_message_id': msg5.message_id,
						'reply_markup': 
							{ 'keyboard' : [ 
								[ 'Submit' , 'Cancel'] ],  
							'remove_keyboard': true, }
							};
				
					
					var finalDateString = theYear + '-' + inMonths + '-' + inDays + 'T' + inHours + ':' + inMinutes + ':' + '00';
					if ( payload4.id == msg5.reply_to_message.id ) {
						console.log('last outgoing: ' + payload4.message_id + ' last incoming: ' + msg5.reply_to_message.message_id);
						telegram.sendMessage(msg5.chat.id, 'Please review the below and SUBMIT or CANCEL. \n' + finalDateString, finalMsg )
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
								'remove_keyboard': true }
								};

						if (msg6.text == 'Submit') {
							telegram.sendMessage(msg6.chat.id, 'New target added!', closeOut);
							telegram.removeTextListener(confirmReg) }
						else {telegram.sendMessage(msg6.chat.id, 'Snake? Snake?! Snaaaaake!', closeOut);
							telegram.removeTextListener(confirmReg) };
						
						
		})})}})})}})})}})})}})})});	
		
		
		
