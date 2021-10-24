const TICKS_PER_MILE = 5280*2
const MILLIS_PER_HOUR = 1000 * 60 * 60
const DEBOUNCE_TIME = 20
const SPEED_SMOOTHING = 0.5


module.exports = {
  processRun: function(rawData) {
    const ticks = debounce(rawData)
    let speed = 0

    let lastSecond = 1000 
    let data = []
    let acc = []

    ticks.forEach((t, i) => {
      if (t > lastSecond) {
        const ticksPerMillis = (acc.length - 1) / (acc[acc.length - 1] - acc[0])
        const ticksPerHour = ticksPerMillis * MILLIS_PER_HOUR
        const immediateSpeed = ticksPerHour / TICKS_PER_MILE
        speed = SPEED_SMOOTHING*speed + (1 - SPEED_SMOOTHING)*immediateSpeed
        data.push({
          time: lastSecond/1000, 
          speed,
          distance: i / TICKS_PER_MILE,
          acc,
        })
        lastSecond += 1000
        acc = [t]
      } else {
        acc.push(t)
      }
    })


    return {
      startTime: rawData.startTime,
      data,
      totalTime: data[data.length - 1].time,
      totalDistance: data[data.length - 1].distance,
      maxRectangle: calculateMaxRectangle(data),
      bestMile: calculateFastestMile(data)
    }
  }
}

function calculateFastestMile(data) {
  let left=0, right=0
  let mileTime = 10000
  let done = false
  while (right < data.length) {
    while (data[right].distance < data[left].distance + 1) {
      right = right + 1
      if (right >= data.length) {
        done = true
        break
      }
    }
    if (done) {
      break
    }
    if ((data[right].time - data[left].time) < mileTime) {
      mileTime = data[right].time - data[left].time
    }
    left = left + 1
  }
  return {mileTime, left, right}
}

function calculateMaxRectangle(data) {
  if (data.length === 0) return null
  if (data.length === 1) {
    return {
      start: data[0].time - 1,
      end: data[0].time,
      height: data[0].speed,
      area: data[0].speed
    }
  }

  const stack = []
  let maxAreaRect = {area: -1}

  data.forEach((d, i) => {
    while (stack.length > 0  && (i==data.length || stack[stack.length-1].height >= d.speed)) {
      const poppedBar = stack.pop()
      const leftTime = stack.length === 0 ? -1 : stack[stack.length-1].time
      const area = poppedBar.height * (d.time - leftTime)
      if (area > maxAreaRect.area) {
        maxAreaRect = {
          start: leftTime, 
          end: d.time, 
          height: poppedBar.height,
          area
        } 
      }
    }
    stack.push({time:d.time, height: d.speed})
  })
  return maxAreaRect
}

function debounce(tickData) {
  const ticks = []
  let lastTick
  tickData.ticks.forEach((t, i) => {
    if (i==0) {
      lastTick = parseInt(t)-parseInt(tickData.ticks[0])
    } else {
      const thisTick = parseInt(t)-parseInt(tickData.ticks[0])
      if (thisTick - lastTick > DEBOUNCE_TIME) {
        ticks.push(thisTick)
        lastTick = thisTick
      }
    }
  })
  return ticks
}
