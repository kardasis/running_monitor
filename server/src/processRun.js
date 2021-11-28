const { TICKS_PER_MILE, MILLIS_PER_HOUR, DEBOUNCE_TIME, SPEED_SMOOTHING } = require('./constants')

module.exports = {
  processRun: function(rawData) {
    const ticks = debounce(rawData)

    const deltaTicks = []
    ticks.forEach((d, i) => {
      if (i > 0) {
        deltaTicks.push(ticks[i] - ticks[i-1])
      }
    })

    let data = []
    let second = 1
    let i = 0
    let speed = 0

    const lastTick = ticks[ticks.length - 1]
    let cumulativeCalories = 0

    while (1000 * second < lastTick) {
      const windowBegin = i
      while (ticks[i] < 1000 * second) {
        i++
      }
      const ticksPerMillis = (i - windowBegin)/(ticks[i] - ticks[windowBegin]) 
      const immediateSpeed = isNaN(ticksPerMillis) ? 0 : ticksPerMillis * MILLIS_PER_HOUR / TICKS_PER_MILE 
      speed = immediateSpeed * (1-SPEED_SMOOTHING) + SPEED_SMOOTHING * speed
      const incline = 1
      const weight = 192
      const calories = (1/60) * (weight/26400) * ( speed * (322 + 14.5 * incline) + 210 )

      data.push({
        time: second, 
        speed,
        distance: i / TICKS_PER_MILE,
        calories
      })
      cumulativeCalories += calories
      second += 1
    }

    return {
      startTime: rawData.startTime,
      data,
      totalTime: data[data.length - 1].time,
      totalDistance: data[data.length - 1].distance,
      maxRectangle: calculateMaxRectangle(data),
      bestMile: calculateFastestMile(data),
      cumulativeCalories
    }
  }
}

function calculateFastestMile(data) {
  let left=0, right=0, bestLeft, bestRight
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
      bestLeft = data[left].time
      bestRight = data[right].time
      leftD = data[left].distance
      rightD = data[right].distance
    }
    left = left + 1
  }
  return {mileTime, left: bestLeft, right: bestRight, leftD, rightD}
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
  const trimmedTicks = tickData.ticks.slice(0, -1)
  trimmedTicks.forEach((t, i) => {
    if (i==0) {
      lastTick = parseInt(t)-parseInt(trimmedTicks[0])
    } else {
      const thisTick = parseInt(t)-parseInt(trimmedTicks[0])
      if (thisTick - lastTick > DEBOUNCE_TIME) {
        ticks.push(thisTick)
        lastTick = thisTick
      }
    }
  })
  return ticks
}

