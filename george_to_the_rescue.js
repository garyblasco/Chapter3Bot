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
			[ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun' ],
			['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] ] },
    		'one_time_keyboard': true
			};
			
			
	telegram.sendMessage(msg.chat.id, 'pick dat month', keyMonths )
    .then(payload => { telegram.onText(/\S\S\S/, function (msg2) {
    
    	inMonths = msg2.text; 
    	const keyDays = {
		'reply_to_message_id': msg2.message_id,
		'reply_markup': { 'keyboard' : [ 
			[ '01', '02', '03', '04', '05', '06', '07'],
			[ '08', '09', '10', '11', '12', '13', '14'],
			[ '15', '16', '17', '18', '19', '20', '21'],
			[ '22', '23', '24', '25', '26', '27', '28'],
			[ '29', '30', '31', '--', '--', '--', '--'] ] },
			'one_time_keyboard': true
			};
			
    	if ( payload.id == msg2.reply_to_message.id ) {
    		console.log('ask for month id: ' + payload.message_id + ' new input responding to: ' + msg2.reply_to_message.message_id);
			telegram.sendMessage(msg2.chat.id, 'pick dat day', keyDays )
			.then(payload2 => { telegram.onText(/\d\d/, function (msg3) {
			
			inDays = msg3.text;
			const keyHours = {
			'reply_to_message_id': msg3.message_id,
			'reply_markup': { 'keyboard' : [ 
				[ '00', '01', '02', '03', '04', '05'],
				[ '06', '07', '08', '09', '10', '11'],
				[ '12', '13', '14', '15', '16', '17'],
				[ '18', '19', '20', '21', '22', '23'] ] },
				'one_time_keyboard': true
				};
			
    		if ( payload2.id == msg3.reply_to_message.id ) {
    			console.log('ask for days id: ' + payload2.message_id + ' new input responding to: ' + msg3.reply_to_message.message_id);
				telegram.sendMessage(msg3.chat.id, 'pick dem hours', keyHours )
				.then(payload3 => { telegram.onText(/\d\d/, function (msg4) {
				
				inHours = msg4.text;
				const keyMinutes = {
				'reply_to_message_id': msg4.message_id,
				'reply_markup': { 'keyboard' : [ 
					[ '00', '05', '10', '15'],
					['20', '25', '30', '35'],
					['40', '45', '50', '55'], ] },
					'one_time_keyboard': true
					};
					
							
				if ( payload3.id == msg4.reply_to_message.id ) {
    				console.log('ask for hours id: ' + payload3.message_id + ' new input responding to: ' + msg4.reply_to_message.message_id);
					telegram.sendMessage(msg4.chat.id, 'pick dem hours', keyMinutes )
					.then(payload4 => { telegram.onText(/\d\d/, function (msg5) {
				
					inMinutes = msg5.text;
							
					var finalDateString = theYear + '-' + inMonths + '-' + inDays + 'T' + inHours + ':' + inMinutes + ':' + '00';
							
					telegram.sendMessage(msg5.chat.id, 'your dates is: ' + finalDateString );

		})})}})})}})})}})})});	