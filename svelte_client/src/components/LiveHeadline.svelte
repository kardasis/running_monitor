<script>
  import {durationString} from '../utils/time'
  import { afterUpdate } from 'svelte'
  export let eventData
  export let runInfo

  $: timeString = durationString(eventData?.time)
  $: fastestMileString = eventData?.fastestMile ? durationString(eventData.fastestMile.bestTime/1000): '-'
  $: fastestLapString = eventData?.fastestLap ? durationString(eventData.fastestLap.bestTime/1000): '-'
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
      <span class="content">{timeString}</span>
    </div>
  </div>
  <div class="datum">
    <label class="label"> Fastest Lap: </label>
    <div class="content">
      <span class="content">{fastestLapString}</span>
    </div>
  </div>
  <div class="datum">
    <label class="label"> Fastest Mile: </label>
    <div class="content">
      <span class="content">{fastestMileString}</span>
    </div>
  </div>
  <div class="datum">
    <label class="label"> Largest Rect: </label>
    <div class="content">
      <span class="content">xxx</span>
    </div>
  </div>
</div>

<style lang="scss">
  .container {
    width: 300px;
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
    line-height: 80px;
    text-align: left;
    align-self: flex-start;
    margin-left: 10px;
  }
  span.content {
    font-weight: bold;
    font-size: 90px
  }
  .label {
    align-self: flex-start;
  }
  .datum {
    margin-top: 15px;
    display: flex;
    flex-direction: column;
  }
</style>
