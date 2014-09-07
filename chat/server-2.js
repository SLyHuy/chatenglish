var fs = require('fs'),
	WebSocketServer = require('ws').Server, 
	FB = require('fb'),
	websocket = require('./lib/websocket.v2');

function startServer(){
	/* Run online */
	var https = require('https'),
		options = {
			key: fs.readFileSync('/home/swind/public_html/clients/svplus/chatenglish/lib/cert/swind.vn.key'),
			cert: fs.readFileSync('/home/swind/public_html/clients/svplus/chatenglish/lib/cert/swind.vn.crt')
		},
		app = https.createServer(options).listen(9300, function() {
		console.log('Server is listening on 9300');
	});
	var wss = new WebSocketServer({server: app});
	/* End online */

	/* Run developing */
	// var wss = new WebSocketServer({port: 9300}, function(){
	// 	console.log('Server is listening on 9300');

	// });
	/* End Run developing */

	wss.on('connection', function(ws) {
		websocket.sendMessage(ws, {
			from: 'system',
			type: 'chat',
			message: 'Loading...'
		});
		var query = require('querystring').parse(ws.upgradeReq.url.split('?')[1]);
		FB.setAccessToken(query.accessToken);
		FB.api('/' + query.userID, function (res){
			console.log(JSON.stringify(res));
			if(!res || res.error || query.userID != res.id) {
			   	console.log(!res ? 'error occurred' : res.error);
			   	websocket.sendMessage(ws, {
					from: 'system',
					type: 'chat',
					message: 'Error! Please try again.'
				});
			   	ws.close();
			}
			else{
				websocket(ws).onOpen();
				ws.on('message', websocket(ws).onMessage);
				ws.on('close', websocket(ws).onClose);
			}
		});
	});
}

/* developer mode */
//startServer();

/* Using cluster to make multi proccess avoid server crash by hacking*/
var cluster = require('cluster');
var workers = process.env.WORKERS || require('os').cpus().length;

if (cluster.isMaster){
	console.log('Start cluster with %s workers', workers);

	for (var i = 0; i < workers; ++i) {
		var worker = cluster.fork().process;
		console.log('Worker %s started.', worker.pid);
	}

	cluster.on('exit', function(worker){
		console.log('Worker %s died. restart...', worker.process.pid);
		cluster.fork();
	});

}else{
	startServer();
}

process.on('uncaughtException', function (err){
	console.error((new Date).toUTCString() + ' uncaughtException: ', err.message)
	console.error(err.stack);

	var mess = '*****************************\n\r';
	mess += (new Date).toUTCString() + ' uncaughtException: ' + err.message + '\n\r\n\r';
	mess += err.stack;
	mess += '\n\r*****************************\n\r\n\r';

	fs.appendFile('logerror.txt', mess, encoding = 'utf8', function (err) {
	    if (err) throw err;
	    process.exit(1);
	});
});