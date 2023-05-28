import { WebSocketServer } from 'ws';
const server = new WebSocketServer({
    port: 8080
});

let sockets: any[] = [];

let senderSocket: any = undefined;
let receiverSocket: any = undefined;

server.on('connection', function (socket, request) {
    sockets.push(socket);

    console.log(`New connection from ${request.socket.remoteAddress}`)

    // When you receive a message, send that message to every socket.
    socket.on('message', function (msg:string) {
        const payload = JSON.parse(msg);
    
        if (payload.type == "auth") {
            if (payload.isSender == true) {
                senderSocket = socket;
                console.log(`Physical connected!`);
            } else {
                receiverSocket = socket;
                console.log(`Virtual connected!`)
            }

            return;
        } else if (payload.type == "portdata_recv" && socket == senderSocket) {
            console.log(`FROM ADP> ${payload.data}`);
            if (receiverSocket) {
                receiverSocket.send(msg)
            } else {
                console.error("no receiver socket");
            }
            return;
        } else if (payload.type == "portdata_recv" && socket == receiverSocket) {
            console.log(`TO ADP> ${payload.data}`);
            if (senderSocket) {
                senderSocket.send(msg)
            } else {
                console.error("no sender socket");
            }
            return;
        }


        //broadcast message to everyone?!
        sockets.forEach(s => s.send(msg));
    });

    // When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function () {
        if (senderSocket === socket) {
            senderSocket = undefined;
            console.log(`Physical disconnected.`);
        }
        if (receiverSocket === socket) {
            receiverSocket = undefined;
            console.log(`Virtual disconnected.`);
        }

        sockets = sockets.filter(s => s !== socket);
    });
});