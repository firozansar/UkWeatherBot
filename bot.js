
var TelegramBot = require('node-telegram-bot-api');
const TOKEN = process.env.TELEGRAM_TOKEN;
//var Q = require('Q');
//var request = Q.denodeify(require("request"));

const options = {
  webHook: {
    // Port to which you should bind is assigned to $PORT variable
    // See: https://devcenter.heroku.com/articles/dynos#local-environment-variables
    port: process.env.PORT
    // you do NOT need to set up certificates since Heroku provides
    // the SSL certs already (https://<app-name>.herokuapp.com)
    // Also no need to pass IP because on Heroku you need to bind to 0.0.0.0
  }
};
// Heroku routes from port :443 to $PORT
// Add URL of your app to env variable or enable Dyno Metadata
// to get this automatically
// See: https://devcenter.heroku.com/articles/dyno-metadata
const url = process.env.APP_URL;
const bot = new TelegramBot(TOKEN, options);
bot.setWebHook(`${url}/bot${TOKEN}`);

//var bot = new TelegramBot(token, {polling: true});
bot.getMe().then(function (me) {
  console.log('Hi my name is %s!', me.username);
});

// Listen for any kind of message. There are different kinds of
// messages.

// Just to ping!
bot.on('message', function onMessage(msg) {
  bot.sendMessage(msg.chat.id, 'I am alive on Heroku!');
});

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;
//
//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Received your message');
// });

bot.onText(/\/start/, function (msg, match) {
  var fromId = msg.from.id; // get the id, of who is sending the message
  var message = "Welcome to your WeatherBot\n"
  message += "Get weather update by sending /weather [your_city] command."
  bot.sendMessage(fromId, message);
});

// match /weather [whatever]
bot.onText(/\/weather (.+)/, function (msg, match) {
  var fromId = msg.from.id; // get the id, of who is sending the message
  var postcode = match[1];
  getWeatherData(postcode)
  .then(function(data){
    var message = "Weather today in the UK postcode: "+postcode+"\n";
    message += data.wx_desc+"\n"
    message += "temp: "+data.temp_c+"C or "+data.temp_f+"F"
    bot.sendMessage(fromId, message);
  });

});

function getWeatherData(postcode){
  var app_id = process.env.WEATHER_APP_ID;
  var app_key = process.env.WEATHER_APP_KEY;
  var url = "http://api.weatherunlocked.com/api/current/uk."+postcode
  url += "?app_id="+app_id+"&app_key="+app_key

  var options ={
      url: url,
      method: "GET",
      json:true,
    }
    var response = request(options);
    return response.then(function (r){
        return r[0].body
    })
}
