var aClientWatingID = null; //this is id of ws of 1 waiting client;
var idGenerate = 0;
var listWs = {};
//var setting = require('./settings.js').init();

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
			if (typeof ws == 'object'){
				idGenerate++;
				ws.wsID = 's' + idGenerate;
				listWs[ws.wsID] = ws;

				if (aClientWatingID == null){
					aClientWatingID = ws.wsID;
					sendMessage(ws, 'system', 'Waiting a stranger...');
				}
				else{
					//Connect 2 ws
					ws.strangerID = aClientWatingID;
					listWs[aClientWatingID].strangerID = ws.wsID;
					aClientWatingID = null;

					//ws.timeStart = listWs[ws.strangerID].timeStart = new Date();

					sendMessage(ws, 'system', 'Let\'s say "hi" with the Stranger.');
					sendMessage(listWs[ws.strangerID], 'system', 'Stranger has joined the room. Let\'s say "hi"');
				}
			}
			//setting.increase('TotalVisitor');
		},
		onMessage: function(message){
			if (listWs[ws.strangerID]){
				sendMessage(listWs[ws.strangerID], 'stranger', message);
			}
		},
		onClose: function(){
			if (listWs[ws.strangerID]){
				sendMessage(listWs[ws.strangerID], 'system', 'Stranger has left the room. Let\'s exit and make a new chat with another stranger.');
			}

			// var totalTime = (new Date()).getTime() - ws.timeStart.getTime();
			// setting.increase('TotalTimeChat', totalTime / 1000);

			delete listWs[ws.wsID];			
		}
	};
};

module.exports.sendMessage = sendMessage;
