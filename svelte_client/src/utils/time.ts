export default {
  pad: function(num: number, size: number): String {
    let s = num.toString()
    while (s.length < size) s = "0" + s
    return s
  },

  durationString: function(seconds: number): String  {
    const s = seconds % 60
    const m = ((seconds -s)/60) % 60
    const h = (seconds - s - 60*m)/3600
    if (h > 0) {
      return `${h}:${this.pad(m, 2)}:${this.pad(s, 2)}`
    } else if (m>0) {
      return `${m}:${this.pad(s, 2)}`
    } else {
      return `${s}`
    }

  }
}
