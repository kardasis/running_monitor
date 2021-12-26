<script>
  import { BASE_DOMAIN } from '../utils/constants'
  import { onMount } from 'svelte';
  import LiveChart from './LiveChart.svelte'
  import LiveHeadline from './LiveHeadline.svelte'
  import LiveGhostList from './LiveGhostList.svelte'

  let connection
  let state = 'standby'
  let eventData
  let runInfo = []

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
  <LiveHeadline {runInfo} {eventData} />
  <div class="right-panel" >
    <LiveGhostList {runInfo} />
    <LiveChart {runInfo} />
  </div>
</div>


<style lang="scss">
  .right-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    flex: 1;
  }
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
    height: 100%;
    display: flex;
    flex-direction: row;
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
</style>
