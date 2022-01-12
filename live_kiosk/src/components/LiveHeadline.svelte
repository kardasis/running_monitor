<script>
  import { durationString } from '../utils/time'
  import api from '../utils/api'
  import { onMount } from 'svelte'
  export let eventData
  export let runInfo

  let history

  onMount(async () => {
      history = await api.fetchHistoricalBests()
    })

  $: timeString = durationString(eventData?.time)
  $: historicalFastestMileString = history?.bestDistances?.oneMile?.time ? durationString(history.bestDistances.oneMile.time): '-'
  $: historicalFastestLapString = history?.bestDistances?.lap.time ? durationString(history.bestDistances.lap.time): '-'
  $: fastestMileString = eventData?.fastestDistances?.mile ? durationString(eventData.fastestDistances.mile.bestTime/1000): '-'
  $: fastestLapString = eventData?.fastestDistances?.lap ? durationString(eventData.fastestDistances.lap.bestTime/1000): '-'
</script>

<div class="container">
  <div class="datum">
    <label class="label"> Speed: </label>
    <div class="content">
      <span class="content"> {eventData?.speed?.toFixed(2) || '0'} </span>
    </div>
  </div>
  <div class="datum">
    <label class="label"> Time: </label>
    <div class="content">
      <span class="content time-content">{timeString}</span>
    </div>
  </div>
  <div class="bests">
    <div class="datum">
      <div class="label">
        <label class="label"> Fastest Lap: </label>
        <div class="historical">({historicalFastestLapString})</div>
      </div>
      <div class="content">
        <div class="currentRun">{fastestLapString}</div>
      </div>
    </div>
    <div class="datum">
      <div class="label">
        <label class="label"> Fastest Mile: </label>
        <div class="historical">({historicalFastestMileString})</div>
      </div>
      <div class="content">
        <div class="currentRun">{fastestMileString}</div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .container {
    min-width: 300px;
    margin: 20px;
    align-self: flex-start;
    border: 1px solid black;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    padding: 20px 5px;
    & div {
      flex: 1;
    }
  }
  div.content {
    color: red;
    line-height: 80px;
    text-align: left;
    align-self: flex-start;
    margin-left: 10px;
  }
  span.content {
    &.time-content {
      font-size: 70px
    }
    color: red;
    font-weight: bold;
    font-size: 90px
  }
  label.label {
    color: #bbb;
    font-size: 20px;
    align-self: center;
  }
  .datum {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
  }

  div.label {
    color: #aaa;
    font-size: 60px;
    display: flex;
    flex-direction: row;
    div,label {
      align-content: center;
    }
  }
  .bests {
    div.historical {
      font-size: 30px;
    }
    .content {
      width: 100%;
    }
    div.currentRun {
      font-size: 75px;
      padding-right: 10px;
    }
    padding-left: 5px;
    background-color: #333;
  }
</style>
