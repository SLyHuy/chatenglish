var roomList = [],
	currentWait = '',
	clientWait = [];
var user = require('./users.js'),
	setting = require('./settings.js').init();
var sendMessage = function(sender, from, mess){
	var data = JSON.stringify({
		from: from, 
		mess: mess
	});
	sender.send(data);
};
module.exports = function(ws){
	return {
		onOpen: function(){
			user.wait(ws);
			setting.increase('TotalVisitor');
		},
		onMessage: function(message){
			user.findInRoom(ws, function(me, client){
				if(me != client) sendMessage(client, 'stranger', message);
			});
		},
		onClose: function(){
			var rid = user.findInRoom(ws, function(me, client){
				if(me != client){
					sendMessage(client, 'system', 'Stranger has left the room. Let\'s exit and make a new chat with another stranger.');
					client.close();
				}
			});
			if(rid != -1){
				var totalTime = user.closeRoom(rid);
				setting.increase('TotalTimeChat', totalTime);
			}
		}
	};
};

module.exports.sendMessage = sendMessage;
var funcInterval = user.letJoinToChat(sendMessage);
setInterval(funcInterval, 200);