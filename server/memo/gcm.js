var gcm = require('node-gcm');

var message = new gcm.Message();

// message.addData('type', 'user.help');
// message.addData('userId', 'user.help');

// message.addData('type', 'owner.response');
// message.addData('type', 'user.willCome');

var regIds = ['APA91bGayQPp2rAXmcWxkL9O35YvfNRJO00u1bEWFcxsAr_QXNvw5Y1u13ckjlnsOuzISREKv7yo1yXRRgyIAV5Ytlq72LVPmgV_C69VoPCCfKqtDq72Qjb3QNb8poAH2WzLAuQuKwlNZFCn_iFHyUFDVB_HiheS0Q'];

var sender = new gcm.Sender('AIzaSyBtsfBOuS39MDxH3Q7lM4DEJIPC05sADHk');

sender.send(message, regIds, function(err, result) {
  if (err) console.error(err);
  else console.log(result);
});
