const WebSocket=require('ws');

const wss=new WebSocket.Server({port:8080});

function sendAll(data) {
	wss.clients.forEach((client)=>{
		if (client.readyState===WebSocket.OPEN) {
			console.log(data);
			client.send(data);
		}
	});
}
wss.on('connection',function connection(ws) {
	ws.isAlive=true;
	ws.on('pong',heartbeat);
	ws.on('message',sendAll);
	ws.on('close',()=>{
		console.log("A user has left the chat room");
		sendAll('{"type":"disconnect","message":""}');
	});
});


function noop() {}
function heartbeat() {this.isAlive=true;}
// check alive
const interval=setInterval(()=>{
	wss.clients.forEach((client)=>{
	if (client.isAlive===false) {
		console.log("A user has left the chat room");
		sendAll('{"type":"disconnect","message":""}');
		return client.terminate();
	}
	client.isAlive=false;
	client.ping(noop);
	});
},1000);
