var aClientWatingID = null; //this is id of ws of 1 waiting client;
var idGenerate = 0;
var listWs = {};
//var setting = require('./settings.js').init();

var sendMessage = function(sender, mess){
	sender.send(JSON.stringify(mess));
};

module.exports = function(ws){
	return {
		onOpen: function(){
			if (typeof ws == 'object'){
				idGenerate++;
				ws.wsID = 's' + idGenerate;
				listWs[ws.wsID] = ws;

				console.log(idGenerate, listWs);

				if (aClientWatingID == null){
					aClientWatingID = ws.wsID;
					sendMessage(ws, {
						from: 'system',
						type: 'chat',
						message: 'Waiting a stranger...'
					});
				}
				else{
					//Connect 2 ws
					ws.strangerID = aClientWatingID;
					console.log(aClientWatingID);
					listWs[aClientWatingID].strangerID = ws.wsID;
					aClientWatingID = null;

					//ws.timeStart = listWs[ws.strangerID].timeStart = new Date();

					sendMessage(ws, {
						from: 'system',
						type: 'chat',
						message: 'Let\'s say "hi" with the Stranger.'
					});
					sendMessage(listWs[ws.strangerID], {
						from: 'system',
						type: 'chat',
						message: 'Stranger has joined the room. Let\'s say "hi".'
					});
				}
			}
			//setting.increase('TotalVisitor');
		},
		onMessage: function(message){
			if (listWs[ws.strangerID] && message){
				try{
					message = JSON.parse(message);
				}
				catch(err){
					console.log(err);
				}

				if (message.type == 'chat'){
					var objSend = {
						from: 'stranger',
						type: 'chat',
						message: message.message
					};
					sendMessage(listWs[ws.strangerID], objSend);
				}
				else if (message.type == 'action'){
					if (message.action == 'typing'){
						var objSend = {
							from: 'stranger',
							type: 'action',
							action: 'typing'
						};
						sendMessage(listWs[ws.strangerID], objSend);
					}
					else if (message.action == 'stop type'){
						var objSend = {
							from: 'stranger',
							type: 'action',
							action: 'stop type'
						};
						sendMessage(listWs[ws.strangerID], objSend);
					}
				}				
			}
		},
		onClose: function(){
			if (listWs[ws.strangerID]){
				sendMessage(listWs[ws.strangerID], {
						from: 'system',
						type: 'chat',
						message: 'Stranger has left the room. Let\'s exit and make a new chat with another stranger.'
					});
			}

			// var totalTime = (new Date()).getTime() - ws.timeStart.getTime();
			// setting.increase('TotalTimeChat', totalTime / 1000);

			if (ws.wsID == aClientWatingID){
				aClientWatingID = null;
			}

			delete listWs[ws.wsID];
		}
	};
};

module.exports.sendMessage = sendMessage;
