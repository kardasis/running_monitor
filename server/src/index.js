const keypress = require('keypress')
const  SerialPort= require('serialport')
const {putToS3} = require('./aws')
const { TICKS_PER_MILE, SECONDS_PER_HOUR } = require('./constants')
const dotenv = require('dotenv')

dotenv.config()

let state = 'standby'
let ticks
let startTime
let lastTickTime

keypress(process.stdin);
process.stdin.on('keypress', function (ch, key) {
  if (key && key.name === "c" && key.ctrl) {
    console.log("bye bye");
    process.exit();
  } else if (key && key.name == 'up') {
  putToS3(
    'run-' + Date.now() + '.json', 
    {ticks: [100, 420, 732], startTime: Date.now()}, 
    'ak-sandbox')
  } else if (key && key.name == 'down') {
    // fake_speed -= .1
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();

SerialPort.list().then((list) => {
  let port
  let parser
  if (list.some(portInfo => portInfo.path.includes('ttyUSB0'))) {
    port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 })
    port.on("open", () => {
      console.log('connected to arduino')
    })
    parser = port.pipe(new SerialPort.parsers.Readline({ delimiter: '\n' }))
  } else {
    console.log('failed to connect to arduino')
  }
  parser.on('data', handleData)
})

function handleData(data) {
  console.log(data, state)
  if (state == 'standby') {
    state = 'running'
    ticks = []
    startTime = Date.now()
  } 
  ticks.push(data)
  lastTickTime = Date.now()
}

function endRun() {
  console.log('finalizing run')
  uploadRun()
  state = 'standby'
}

function uploadRun() {
  console.log(process.env.BUCKET_NAME)
  putToS3(
    'run-' + startTime + '.json', 
    {ticks, startTime}, 
    process.env.BUCKET_NAME)
}

var intervalId = setInterval(activityCheck, 1000);
function activityCheck() {
  if (state == 'running') {
    const now = Date.now()
    if (now-lastTickTime > 2000) {
      endRun()
    }
  }
}


// const wss = new WebSocket.Server({ port: 8081 });
// wss.on('connection', function connection(ws): void {
//   console.log('connected to websocket')
//   ws.on('message', function incoming(data) {
//     const message = JSON.parse(data as string)
//     if (message.message === 'start') {
//       console.log('starting run')
//       currentRun = new Run(ws)
//     } else if (message.message === 'stop') {
//       console.log('stopping run')
//       ws.send(JSON.stringify({ message: 'stopping run' }))
//       currentRun.finish(!!parser)
//     }
//   })

//   if (parser) {
//     parser.on('data', data => {
//       const jsonData = JSON.parse(data)
//       if (currentRun && jsonData.data) {
//         currentRun.addDataPoint(jsonData)
//       }
//     })
//   }
// })


