import WebSocket from 'ws';
const { SerialPort } = require('serialport');

var myPort = new SerialPort({
    baudRate: 9600,
    path: "COM2"
});

(async () => {
    //@ts-ignore
    //console.log(serialPorts);

    myPort.on('open', function () {
        const ws = new WebSocket('ws://127.0.0.1:8080');

        ws.on('error', console.error);

        ws.on('open', function open() {
            ws.send(JSON.stringify({
                type: "auth",
                isSender: false
            }));
        });

        ws.on('message', function message(data) {
            const parsedData = JSON.parse(data.toString());
            myPort.write(Buffer.from(parsedData.data, 'hex'), function () {
                console.log(`FROM ADP> ${parsedData.data}`);
            });
        });

        myPort.on('data', function (data: Buffer) {
            //we received data from adp

            console.log(`TO ADP> ${data.toString('hex')}`);

            //send data to websocket server
            ws.send(JSON.stringify({
                type: "portdata_recv",
                data: data.toString('hex')
            }));
        });

        //console.log(myPort); // or console.log(port)


    });
})();

