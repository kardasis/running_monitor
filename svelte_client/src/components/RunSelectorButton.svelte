<script>
  import {durationString} from '../utils/time'

  export let run, selected, clickHandler

  $: runDuration = durationString(run.totalTime)

  const date = () => {
      const timestamp = run.runId.split('-')[1].split('.')[0]
      const date = new Date(0)
      date.setUTCSeconds(timestamp/1000)
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }
      return date.toLocaleDateString('en-US', options) 
    }

  const activateRun = () => {
      clickHandler(run)
    }
</script>

<button class="run-button {selected ? 'selected' : ''}" 
       on:click={() => activateRun()}>
       <h3>{date()}</h3>
       <p>dist: {run.totalDistance.toFixed(2)}</p>
       <p>time: {runDuration}</p>
       <p>cals: {run.totalCalories.toFixed(0)}</p>
</button>

<style lang="scss">
  h3 {
    margin: 4px 2px 2px;
  }
  p {
    margin: 2px 50px 2px;
  }
  button {
    text-align: left;
    border-width: 0px 0px 1px;
    background-color: #ffffdd;
    margin: 0;
    padding: 5px 20px;
    &:hover {
      background-color: lightgrey;
    }
    &.selected {
      background-color: #eee;
    }
  }
</style>
