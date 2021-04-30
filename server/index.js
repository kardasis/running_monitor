const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')

const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 });

const port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 })
const parser = port.pipe(new Readline({ delimiter: '\n' }))

const speeds = []

port.on("open", () => {
   console.log('connected to arduio')
});

wss.on('connection', function connection(ws) {
  console.log('connected to websocket')
  parser.on('data', data =>{
    if (!data.includes('buffer filling')) {
      speeds.push(data)
      console.log(speeds.length, data)
      ws.send(data, ': ', speeds.length);
    }
  });
})
