var fs = require('fs'),
	WebSocketServer = require('ws').Server, 
	FB = require('fb'),
	websocket = require('./lib/websocket.v2');

var https = require('https'),
	options = {
		key: fs.readFileSync('/home/swind/public_html/clients/svplus/chatenglish/lib/cert/swind.vn.key'),
		cert: fs.readFileSync('/home/swind/public_html/clients/svplus/chatenglish/lib/cert/swind.vn.crt')
	},
	app = https.createServer(options).listen(9300, function() {
	console.log('Server is listening on 9300');
});
var wss = new WebSocketServer({server: app});

/* test */
// var wss = new WebSocketServer({port: 9300}, function(){
// 	console.log('Server is listening on 9300');
// });

wss.on('connection', function(ws) {
	websocket.sendMessage(ws, 'system', 'Loading...');
	console.log(1);
	var query = require('querystring').parse(ws.upgradeReq.url.split('?')[1]);
	FB.setAccessToken(query.accessToken);
	FB.api('/' + query.userID, function (res){
		console.log(JSON.stringify(res));
		if(!res || res.error || query.userID != res.id) {
		   	console.log(!res ? 'error occurred' : res.error);
		   	websocket.sendMessage(ws, 'system', 'Error! Please try again.');
		   	ws.close();
		}
		else{
			websocket(ws).onOpen();
			ws.on('message', websocket(ws).onMessage);
			ws.on('close', websocket(ws).onClose);
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