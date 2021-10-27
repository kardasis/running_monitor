<script>
  import { BASE_DOMAIN } from '../utils/constants'
  import { onMount } from 'svelte';
  import LiveChart from './LiveChart.svelte'
  import LiveSpeed from './LiveSpeed.svelte'
  import LiveGhostList from './LiveGhostList.svelte'


  let connection
  let state = 'standby'
  let eventData
  let runInfo = []
  $: speed = eventData?.speed
  $: timeString = toTimeString(eventData?.time)

  const toTimeString = (secs) => {
      if (secs) {
          const s = secs % 60
          return `${(secs - s)/60}:${parseInt(s).toString().padStart(2, '0')}`
        } else {
            return null
          }
    }


  onMount(async () => {
      connection = new WebSocket(`ws://${BASE_DOMAIN}:8081`);

      connection.onmessage = (event) => {
          const data = JSON.parse(event.data);
          console.log(data)
          if (data.type === "dataPoint") {
            if (state === 'standby') {
              state = 'running'
              runInfo = []
            }
            eventData = data
            runInfo = [...runInfo, data]
          } else if (data.type === 'message' && data.message === 'end') {
            state = 'standby'
          } else if (data.type === 'milestone') {
            state = 'running'
            runInfo = data.runInfo
          }
        }
      connection.onopen = function () {
        console.log("Connected to server");
      }
    })
</script>

<div class="live-container {state}">
  <div class="data-container">
    <LiveSpeed {eventData} {runInfo} />
    <div class="distance-info">
      <div class="current-distance datum">
        <label class="label"> Distance: </label>
        <div class="content">
          <span class="content">{eventData?.distance?.toFixed(3)} </span> mi
        </div>
      </div>
    </div>
    <div class="distance-info">
      <div class="current-distance datum">
        <label class="label"> Time: </label>
        <div class="content">
          <span class="content">{timeString}</span>
        </div>
      </div>
    </div>
  </div>
  <LiveGhostList {runInfo} />
  <LiveChart {runInfo} />
</div>


<style lang="scss">
  .hide {
    visibility: hidden;
  }
  td.content {
    margin-left: 10px;
    text-align: left;
  }
  :global(span.content) {
    font-weight: bold;
    font-size: 40px;
    &.large {
      font-size: 60px
    }
  }
  .live-container {
    &.running {
      background-color: lightgreen;
    }
    &.standby {
      background-color: pink;
    }
  }
  .datum {
    display: flex;
    flex-direction: row;
  }
  .label {
    width: 200px;
    margin-right: 5px;
    text-align: right;
    padding-top: 3px;
  }
  .data-container {
    & > * {
    }
    margin: 20px;
    background-color: #eeffff;
    display: flex;
    flex-direction: row;
  }
</style>
