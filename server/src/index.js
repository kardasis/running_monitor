const {DEBOUNCE_TIME, TICKS_PER_MILE, MILLIS_PER_HOUR } = require('./constants')
const keypress = require('keypress')
const SerialPort= require('serialport')
const WebSocket= require('ws')
const {putToS3, fetchRuns, fetchRun} = require('./aws')
const dotenv = require('dotenv')
const { Faker } = require('./faker')
const loggerFactory = require('./logger')

const { processRun } = require('./processRun')
const express = require('express')
const cors = require('cors')

const SPEED_SMOOTHING = 0
const port = 3030
const app = express()

let wsInterval
let logger
let speedDetails = {}

app.use(cors())

app.get('/run/:name', async (req, res) => {
  const rawRun = JSON.parse(await fetchRun(req.params.name))
  res.json(processRun(rawRun))
})

app.get('/runs', async (req, res) => {
  const runs = await fetchRuns()
  res.json(runs.sort().map(r => {
    return r.Key.split('.')[0]
  }))
})

app.listen(port, () => {
  console.log(`Express listening on port ${port}`)
})


dotenv.config()
console.log(`starting app in environment: ${process.env.ENV}`)

let speed = 0
let state = 'standby'
let ticks = []
let runInfo = []
let startTime
let lastTickTime
let faker
let websocket

if (process.env.ENV == 'DEVELOPMENT') {
  keypress(process.stdin);
  process.stdin.on('keypress', function (ch, key) {
    if (key && key.name === "c" && key.ctrl) {
      console.log("bye bye");
      process.exit();
    } else if (key && key.name == 'k') {
      if (faker) {
        faker.speedUp()
      }
    } else if (key && key.name == 'j') {
      if (faker) {
        faker.speedDown()
      }
    } else if (key && key.name == 's') {
      if (faker) {
        faker.start()
      }
    } else if (key && key.name == 'e') {
      if (faker) {
        faker.stop()
      }
    } 
  })

  process.stdin.setRawMode(true);
  process.stdin.resume();
}

SerialPort.list().then((list) => {
  let port
  let parser
  if (list.some(portInfo => portInfo.path.includes('ttyUSB0'))) {
    port = new SerialPort('/dev/ttyUSB0', { baudRate: 9600 })
    port.on("open", () => {
      console.log('connected to arduino')
    })
    parser = port.pipe(new SerialPort.parsers.Readline({ delimiter: '\n' }))
    parser.on('data', handleData)
  } else {
    console.log('failed to connect to arduino. Fake data time')
    faker = new Faker(handleData, 1.0)
  }
})

function handleData(millis) {
  if (isNaN(parseInt(millis))) return
  if (state == 'standby') {
    state = 'running'
    ticks = []
    debouncedTicks = []
    runInfo = []
    startTime = Date.now()
    logger = loggerFactory(startTime)
  } 
  if (ticks.length == 0 || millis - ticks[ticks.length - 1] > DEBOUNCE_TIME) {
    debouncedTicks.push(millis)
  }
  ticks.push(millis)
  lastTickTime = Date.now()

  let i = debouncedTicks.length - 1
  const windowBegin = i
  const lastTick = debouncedTicks[i]
  while (debouncedTicks[i] > lastTick - 1000) {
    if (i == 0) {
      break
    }
    i--
  }
  const tickCount = (windowBegin - i)
  const elapsedTime = (debouncedTicks[windowBegin] - debouncedTicks[i] )
  const ticksPerMillis = tickCount/elapsedTime 
  const immediateSpeed = isNaN(ticksPerMillis) ? 0 : ticksPerMillis * MILLIS_PER_HOUR / TICKS_PER_MILE 
  speed = immediateSpeed * (1-SPEED_SMOOTHING) + SPEED_SMOOTHING * speed
  speedDetails = {
    i, windowBegin, immediateSpeed, tickCount, elapsedTime, 
    debouncedTicks: debouncedTicks.slice(i, windowBegin + 1)
  }
}

function endRun() {
  console.log('finalizing run')
  uploadRun()
  state = 'standby'
  if (websocket) {
    websocket.send(JSON.stringify({ 
      type: 'message',
      message: 'end'
    }))
  }
}

function uploadRun() {
  console.log('putting to bucket: ' + process.env.BUCKET_NAME)
  if (ticks.length > 10) {
    putToS3(
      'run-' + startTime + '.json', 
      {ticks, startTime}, 
      process.env.BUCKET_NAME)
  }
}

const intervalId = setInterval(intervalHandler, 1000);
function intervalHandler() {
  if (state == 'running') {
    const now = Date.now()
    const timeoutTime = faker ? 1000 : 30000
    if (now - lastTickTime > timeoutTime) {
      endRun()
    }
  }
}

function wsHandler(ws) {
  if (state == 'running') {
    runInfo.push({
      distance: ticks.length / TICKS_PER_MILE,
      time: (ticks[ticks.length - 1] - ticks[0])/1000,
      speed
    })
    logger.info(speedDetails)
    ws.send(JSON.stringify({ 
      type: 'dataPoint',
      ...runInfo[runInfo.length - 1],
    }))
  }
}

const wss = new WebSocket.Server({ port: 8081 });
wss.on('connection', function connection(ws) {
  console.log('connected to websocket')
  websocket = ws
  if (state === 'running') {
    ws.send(JSON.stringify({ type: 'milestone', runInfo }))
  }
  if (wsInterval) {
    clearInterval(wsInterval)
  }
  wsInterval = setInterval(() => {wsHandler(ws)}, 1000);
})


