// Matches /test
TelegramBot.onText(/\/test/, function test(msg) {
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
  TelegramBot.sendMessage(msg.chat.id, 'Do you love me?', opts);
  
});