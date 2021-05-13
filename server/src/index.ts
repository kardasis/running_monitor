import keypress from 'keypress'
import SerialPort from 'serialport'
import WebSocket from 'ws'
import { Run } from './run'
import { TICKS_PER_MILE, SECONDS_PER_HOUR } from './constants'

let fake_speed = 1.0 // mph

type ClientData = {
  timestamp: number
  tickCount: number
  speed: number
}

let currentRun: Run
let sendingData = false

keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {
  if (key && key.name === "c" && key.ctrl) {
    console.log("bye bye");
    process.exit();
  } else if (key && key.name == 'up') {
    fake_speed += .1
  } else if (key && key.name == 'down') {
    fake_speed -= .1
  }
  console.log(`fake_speed: ${fake_speed}`)
});

process.stdin.setRawMode(true);
process.stdin.resume();

const wss = new WebSocket.Server({ port: 8081 });

SerialPort.list().then((list) => {
  let port: SerialPort
  let parser: SerialPort.parsers.Readline
  if (list.some(portInfo => portInfo.path.includes('ttyUSB0'))) {
    port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 })
    port.on("open", () => {
      console.log('connected to arduino')
    })
    parser = port.pipe(new SerialPort.parsers.Readline({ delimiter: '\n' }))
  } else {
    console.log('failed to connect to arduino')
  }

  wss.on('connection', function connection(ws): void {
    console.log('connected to websocket')
    ws.on('message', function incoming(data) {
      const message = JSON.parse(data as string)
      if (message.message === 'start') {
        console.log('starting run')
        currentRun = new Run(ws)
      } else if (message.message === 'stop') {
        console.log('stopping run')
        ws.send(JSON.stringify({ message: 'stopping run' }))
        currentRun.finish(!!parser)
      }
    })

    if (parser) {
      parser.on('data', data => {
        const jsonData = JSON.parse(data)
        if (currentRun && jsonData.data) {
          currentRun.addDataPoint(jsonData)
        }
      })
    } else {
      if (!sendingData) {
        sendFakeData()
        sendingData = true
      }
    }
  })
})

function sendFakeData() {
  const tickTime = 1000 * SECONDS_PER_HOUR / fake_speed / TICKS_PER_MILE
  setTimeout(() => {
    if (currentRun) {
      currentRun.sendFakeData(fake_speed)
    }
    sendFakeData()
  }, tickTime)
}

