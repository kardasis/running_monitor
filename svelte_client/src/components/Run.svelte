<script>
  import RunChart from './RunChart.svelte'
  import {durationString} from '../utils/time'

  export let run = {}
  $: runDistance = run.data[run.data.length - 1].distance.toFixed(3)
  $: runDuration = durationString(run.data[run.data.length - 1].time)
  $: runSpeed = (runDistance/(run.data[run.data.length - 1].time) * 3600).toFixed(3) + ' mph'
  $: fastestMileTime = durationString(run.bestMile.mileTime)
  $: fastestMileSpeed = (3600.0/run.bestMile.mileTime).toFixed(2)
  $: startTime = calculateDisplayTime()
  $: largestRect = `${(run.maxRectangle.area/3600).toFixed(2)}, ${durationString(run.maxRectangle.end - run.maxRectangle.start)} * ${run.maxRectangle.height.toFixed(2)}`

  console.log(run.bestMile)

  const calculateDisplayTime = () => {
      const res = new Date(0)
      res.setUTCSeconds(run.startTime/1000)
      return res.toDateString() + ' ' +  res.toLocaleTimeString()
    }
</script>

<div class="run-container">
  <h2 class="title">{startTime}</h2>
  <div class="metadata row">
    <div class="column">
      <div class="stat">
        <div class="label">Distance:</div><div class="data-content"> {runDistance}</div>
      </div>
      <div class="stat">
        <div class="label">Time:</div><div class="data-content"> {runDuration}</div>
      </div>
      <div class="stat">
        <div class="label">Speed:</div><div class="data-content"> {runSpeed}</div>
      </div>
    </div>
    <div class="column">
      <div class="stat">
        <div class="label">Fastest Mile:</div><div class="data-content"> {fastestMileTime} / {fastestMileSpeed} mph </div>
      </div>
      <div class="stat">
        <div class="label">Largest rect:</div><div class="data-content"> {largestRect}</div>
      </div>
    </div>
  </div>
  <RunChart {run} />
</div>

<style lang="scss">
  .column {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    flex-direction: row;
    & > * {
      flex: 1
    }
  }
  .title {
    text-align: left;
    padding: 20px
  }
  .stat {
    display: flex;
    flex-direction: row;
    padding: 4px;
  }
  .metadata {
    margin-bottom: 20px;
  }
  .data-content {
    text-align: left;
    font-size: 20px;
    padding-left: 10px;
  }
  .label {
    width: 150px;
    text-align: right;
  }
  .run-container {
    margin: 10px;
    border-radius: 10px;
    border: 1px solid black;
    background-color: #eee;
    width: 100%;
  }
</style>
