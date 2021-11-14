function pad(num: number, size: number): String {
  let s = num.toString()
  while (s.length < size) s = "0" + s
  return s
}

export const durationString = function(input: number): String  {
  const seconds = Math.round(input)
  const s = seconds % 60
  const m = ((seconds -s)/60) % 60
  const h = (seconds - s - 60*m)/3600
  if (h > 0) {
    return `${h}:${pad(m, 2)}:${pad(s, 2)}`
  } else if (m>0) {
    return `${m}:${pad(s, 2)}`
  } else {
    return `${s}`
  }

}
