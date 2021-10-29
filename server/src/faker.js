const { TICKS_PER_MILE, MILLIS_PER_HOUR } = require('./constants')

class Faker {
  constructor(handler, initialSpeed = 1.0) {
    this.handler = handler
    this.mph = initialSpeed
    this.startTime = Date.now()
    this.start()
  }

  start() {
    console.log('starting run')
    this.tick()
  }

  tick() {
    const now = Date.now()
    const elapsedTime = now - this.startTime
    if (this.mph > 0) {
      this.handler(elapsedTime)
      let millisToNextTick = MILLIS_PER_HOUR / this.mph / TICKS_PER_MILE 
      millisToNextTick = millisToNextTick * (1 + .03*(Math.random() * 2 - 1))
      this.timeout = setTimeout(() => {this.tick()}, millisToNextTick)
    } else {
      this.timeout = setTimeout(() => {this.tick()}, 20)
    }
  }

  speedUp(){
    this.mph += 0.1
    console.log('new speed: ' + this.mph)
  }
  speedDown(){
    this.mph -= 0.1
    console.log('new speed: ' + this.mph)
  }
  stop() {
    if (this.timeout) {
      clearTimeout(this.timeout)
      console.log('stopping run')
    }
  }
}
module.exports = { Faker }
