/* 
* @Author: jin9x
* @Date:   2014-08-17 05:48:47
* @Last Modified by:   jin9x
* @Last Modified time: 2014-08-17 08:19:09
*/

var maxClient = 2,
	roomList = [],
	clientWait = [],
	waiting = '';
var userFunction = {
	list: function(userList){
		roomList = userList;
	},
	findInRoom: function(byWs, callback){
		for(var i in roomList){
			if(existInList(byWs, roomList[i].player) != -1){
				inList(byWs, roomList[i].player, callback);
				return i;
			}
		}
		return -1;
	},
	wait: function(user){
		if(typeof user == 'object'){
			clientWait.push(user);
		}
	},
	createRoom: function(userList){
		roomList.push({
			timeCreate: (new Date()),
			timeModified: (new Date()),
			player: userList
		});
	},
	closeRoom: function(rid){
		/*if(existInList(waiting, roomList[rid].player)){
			waiting = '';
		}*/
		var totalTime = (new Date()).getTime() - roomList[rid].timeCreate.getTime();
		roomList.splice(rid, 1);
		return totalTime;
	},
	letJoinToChat: function(sendMessage){
		return function(){
			if(clientWait.length > 0){
				var current = clientWait.shift();
				if(typeof waiting == 'undefined' || waiting == ''){
					waiting = current;
					sendMessage(current, 'system', 'Waiting a stranger...');
				}
				else{
					sendMessage(waiting, 'system', 'Stranger has joined the room. Let\'s say "hi"');
					sendMessage(current, 'system', 'Let\'s say "hi" with the Stranger.');
					userFunction.createRoom([waiting, current]);
					waiting = '';
				}
			}
		};
	}
};

var existInList = function(by, list){
	for(var i in list){
		if(list[i] == by){
			return i;
		}
	}
	return -1;
};
var inList = function(by, list, callback){
	for(var i in list){
		callback(by, list[i]);
	}
};

module.exports = userFunction;