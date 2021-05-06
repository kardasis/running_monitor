import dotenv from "dotenv"
import { putToS3 } from './aws'
import SerialPort from 'serialport'
import WebSocket from 'ws'
import moment from 'moment'

const Readline = SerialPort.parsers.Readline

const wss = new WebSocket.Server({ port: 8081 });
const mock = process.argv.length > 2 && process.argv[2] === 'mock'

SerialPort.list().then((list) => {
  let port: SerialPort
  let parser: SerialPort.parsers.Readline
  if (list.some(portInfo => portInfo.path.includes('ttyUSB0'))) {
    port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 })
    port.on("open", () => {
      console.log('connected to arduino')
    })
    parser = port.pipe(new Readline({ delimiter: '\n' }))
  } else {
    console.log('failed to connect to arduino')
  }
  let speeds = []
  let runName = ""

  wss.on('connection', function connection(ws): void {
    console.log('connected to websocket')

    ws.on('message', function incoming(data) {
      const message = JSON.parse(data as string)
      if (message.message === 'start') {
        console.log('starting run')
        ws.send(JSON.stringify({ message: 'starting run' }))
        runName = moment().format();
        speeds = []
      } else if (message.message === 'stop') {
        console.log('stopping run')
        ws.send(JSON.stringify({ message: 'stopping run' }))
        putToS3(runName, speeds, process.env.AWS_BUCKET_NAME)
      }
    })

console.log(parser)
    if (parser) {
      parser.on('data', data => {
        if (!data.includes('buffer filling')) {
          speeds.push(JSON.parse(data))
        ws.send(data)
        }
      })
    } else {
      setInterval(() => {
        const data = '{"millis": 12345, "speed": 1.34, "incline": 0.0}'
        console.log(`sending fake data: ${data}`)
        speeds.push(JSON.parse(data))
        ws.send(data)
      }, 500)
    }
  })
})

