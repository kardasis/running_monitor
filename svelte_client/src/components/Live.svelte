<script>
  import { onMount } from 'svelte';
  import LiveChart from './LiveChart.svelte'
  import LiveSpeed from './LiveSpeed.svelte'
  import LiveGhost from './LiveGhost.svelte'


  let connection
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
      /* connection = new WebSocket("ws://192.168.86.31:8081"); */
      connection = new WebSocket("ws://localhost:8081");

      connection.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "dataPoint") {
              eventData = data
              runInfo = [...runInfo, data]
            } else if (data.type === 'milestone') {
                runInfo = data.runInfo
              }
        }
      connection.onopen = function () {
          console.log("Connected to server");
        }
    })
</script>

<div class="live-container">
  <div class="data-container">
    <LiveSpeed {eventData} {runInfo} />
    <div class="distance-info">
      <div class="current-distance datum">
        <label class="label"> Distance: </label>
        <div class="content">
          <span class="content">{eventData?.distance.toFixed(3)} </span> mi
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
  <LiveGhost {runInfo} />
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
    background-color: #eee;
  }
  .datum {
    display: flex;
    flex-direction: row;
  }
  .label {
    width: 100px;
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
