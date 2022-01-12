<script>
  import RunChart from './RunChart.svelte'
  import {durationString} from '../utils/time'
  import api from '../utils/api'

  export let run = {}
  $: runDistance = run.data[run.data.length - 1].distance.toFixed(3)
  $: runDuration = durationString(run.data[run.data.length - 1].time)
  $: runSpeed = (runDistance/(run.data[run.data.length - 1].time) * 3600).toFixed(3) + ' mph'
  $: fastestMileTime = durationString(run.bestDistances.oneMile.time)
  $: fastestMileSpeed = (3600.0/run.bestDistances.oneMile.time).toFixed(2)
  $: startTime = calculateDisplayTime(run.startTime)
  $: largestRect = `${(run.maxRectangle.area/3600).toFixed(2)}, ${durationString(run.maxRectangle.end - run.maxRectangle.start)} * ${run.maxRectangle.height.toFixed(2)}`
  $: calories = run.totalCalories?.toFixed(0)

  const calculateDisplayTime = (time) => {
      const res = new Date(0)
      res.setUTCSeconds(time/1000)
      return res.toDateString() + ' ' +  res.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

  function deleteWithConfirm(run) {
      if (confirm(`Are you sure you want to delete the run ${run.runId}`)) {
          api.deleteRun(run.runId)
        }
    }


</script>

<div class="run-container">
  <h2 class="title">{startTime}</h2>
  <button class="action-button" on:click={api.duplicateRun(run.runId)}>Duplicate</button>
  <button class="action-button" on:click={deleteWithConfirm(run)}>Delete</button>
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
      <div class="stat">
        <div class="label">Calories</div><div class="data-content"> {calories}</div>
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
    width: calc(100% - 120px);
  }
</style>
