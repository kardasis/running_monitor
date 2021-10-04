import WebSocket from 'ws'
import { DateTime, Duration } from 'luxon'
import dotenv from 'dotenv'
import { putToS3 } from './aws';
import { IotData, DataPoint } from './types';
import { TICKS_PER_MILE } from './constants';

dotenv.config()

export class Run {
  name: string
  dataPoints: DataPoint[]
  ws: WebSocket
  startTime: DateTime
  duration: Duration

  constructor(ws: WebSocket) {
    this.ws = ws
    this.dataPoints = []
    this.startTime = DateTime.now();
    this.name = this.startTime.toISO()

    this.ws.send(JSON.stringify({
      type: 'runStart',
      data: { startTime: this.startTime }
    }))
  }

  finish(mockMode: boolean = false) {
    this.duration = DateTime.now().diff(this.startTime)
    putToS3(this.name, this.dataPoints, process.env.AWS_BUCKET_NAME)
    this.ws.send(JSON.stringify({
      type: 'runEnd',
      data: {
        startTime: this.startTime.toISO(),
        endTime: DateTime.now().toISO(),
        distance: this.dataPoints.length / TICKS_PER_MILE
      }
    }))
  }

  addDataPoint(data: IotData) {
    this.dataPoints.push(data)
    this.ws.send(JSON.stringify({
      type: 'dataPoint',
      data
     }))
  }

  sendFakeData(fake_speed: number) {
    const data = {
      millis: 12345,
      speed: fake_speed,
      incline: 0.0,
      tickCount: this.dataPoints.length
    }
    this.addDataPoint(data)
  }
}