var
    fs = require('fs'),
    app = require('http').createServer(httpServerHandler),
    dgram = require('dgram'),
    udpServer = dgram.createSocket('udp4'),
    io = require('socket.io')(app);

var HTTPPORT = 12345;
var UDPPORT = 12346;
var HOST = '127.0.0.1';




 // UDP client
udpServer.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
    sendPositions(JSON.parse(message));
});
udpServer.bind(UDPPORT, HOST);
console.log('UDP Client running at http://127.0.0.1:' + UDPPORT + '/');




 // HTTP server
function httpServerHandler(req, res) {
    switch (req.url) {
        case '/':
        case '/menu':
            response(res, '/menu.html');
            break;
        case '/paint':
            response(res, '/paint.html');
            break;
        default:
            res.end('Hello World\n');
            break;
    }
}
app.listen(HTTPPORT, HOST);
console.log('Server running at http://127.0.0.1:' + HTTPPORT + '/');




 // Socket.io
var socketToEmit = null;
function sendPositions(data){
    if(socketToEmit){
        socketToEmit.emit('cursorMove', data);
        console.log('Coordinates sent');
    }else{
        console.error('Socket connection is not established! Data not sent...');
    }
}
io.on('connection', function (socket) {
    socketToEmit = socket;
    console.log('Client detected. Socket tunnel is now open.')
});
console.log('Socket IO running');




 // Helpers
function response(res, fileName, contentType) {
    fs.readFile(__dirname + decodeURIComponent(fileName), 'utf8', function (err, content) {
        if (content != null && content != '') {
            res.writeHead(200, {
                'Content-Length': content.length,
                'Content-Type': contentType ? contentType : 'text/html',
                'charset': 'utf-8'
            });
            res.write(content);
        }
        res.end();
    });
}

