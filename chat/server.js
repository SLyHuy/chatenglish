var WebSocketServer = require('ws').Server, 
	FB = require('fb'),
	websocket = require('./lib/websocket');
var wss = new WebSocketServer({port: 9300}, function(){
	console.log('Server is listening on 9300');
});

wss.on('connection', function(ws) {
	var query = require('querystring').parse(ws.upgradeReq.url.split('?')[1]);
	FB.setAccessToken(query.accessToken);
	FB.api('/' + query.userID, function (res){
		//console.log(JSON.stringify(res));
		if(!res || res.error || query.userID != res.id) {
		   console.log(!res ? 'error occurred' : res.error);
		   ws.send(JSON.stringify({from: 'system', mess: 'Connection Error!'}));
		   ws.close();
		   return;
		}else{
			websocket.onOpen(ws);
			ws.on('message', websocket.onMessage(ws));
			ws.on('close', websocket.onClose(ws));
		}
	});

		//console.log("url: ", JSON.stringify(require('querystring').parse(ws.upgradeReq.url.split('?')[1])));
    /*//ws.send(JSON.stringify({from: 'system', mess: 'Stranger has joined the room. Let\'s say "hi"'}));
	console.log('%s connected', ws);
	for(var i in this.clients){
		this.clients[i].send(JSON.stringify({from: 'system', mess: 'Stranger has joined the room. Let\'s say "hi"'}));
	}
	//clients.push(ws);*/
});