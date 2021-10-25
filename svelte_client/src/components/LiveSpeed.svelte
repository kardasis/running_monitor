<script>
  import { afterUpdate } from 'svelte'
  export let eventData
  export let runInfo
  let averageSpeed = 0

  afterUpdate(() => {
      if (runInfo && runInfo.length > 0) {
          averageSpeed = runInfo[runInfo.length - 1].distance/runInfo[runInfo.length - 1].time 
          averageSpeed = (averageSpeed * 3600).toFixed(4)
        } else {
            averageSpeed = 0
          }
    })
</script>

<div class="speed-info">
  <div class="current-speed datum">
    <div class="label"> Speed: </div>
    <div class="content">
      <span class="content large"> {eventData?.speed.toFixed(2) || '0'} </span>mph
    </div>
  </div>
  <div class="average-speed datum">
    <div class="label"> Average: </div>
    <div class="content">
      <span class="content"> {averageSpeed} </span>mph
    </div>
  </div>
</div>

<style lang="scss">
  .speed-info {
    flex: 1; 
  }

  span.content {
    font-weight: bold;
    font-size: 40px;
    &.large {
      font-size: 60px
    }
  }
  .label {
    vertical-align: middle;
    width: 100px;
    margin-right: 5px;
    text-align: right;
    align-self: center;
  }
  .datum {
    display: flex;
    flex-direction: row;
  }
</style>
