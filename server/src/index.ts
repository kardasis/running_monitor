require('dotenv').config()

import { putToS3 } from './aws'
import SerialPort from 'serialport'
import WebSocket from 'ws'
import MockBinding from '@serialport/binding-mock'
import moment from 'moment'

const Readline = SerialPort.parsers.Readline

const wss = new WebSocket.Server({ port: 8081 });
const mock = process.argv.length > 2 && process.argv[2] === 'mock'

let port: SerialPort
if (mock) {
  SerialPort.Binding = MockBinding
  MockBinding.createPort('/dev/ROBOT', { echo: true, record: true })
  port = new SerialPort('/dev/ROBOT')
} else {
  port= new SerialPort('/dev/ttyUSB0', { baudRate: 9600 })
}
const parser = port.pipe(new Readline({ delimiter: '\n' }))


let speeds = []
let runName = ""

port.on("open", () => {
   console.log('connected to arduio')
});

wss.on('connection', function connection(ws) {
  console.log('connected to websocket')

  ws.on('message', function incoming(data) {
    const message = JSON.parse(data as string)
    if (message.message === 'start') {
      console.log('starting run')
      ws.send(JSON.stringify({message: 'starting run'}))
      runName = moment().format();
      speeds = []
    } else if (message.message === 'stop') {
      console.log('stopping run')
      ws.send(JSON.stringify({message: 'stopping run'}))
      putToS3(runName, speeds, process.env.AWS_BUCKET_NAME)
    }
  })

  parser.on('data', data => {
    if (!data.includes('buffer filling')) {
      speeds.push(data)
      ws.send(`${data}: ${speeds.length}`)
    }
  })
})

