<script lang="typescript">
  import LiveGhost from './LiveGhost.svelte'
  import { afterUpdate } from 'svelte'

  export let runInfo

  let averageSpeed, time, distance, ghostSpeeds


  afterUpdate(() => {
    if (runInfo && runInfo.length > 0) {
      time = runInfo[runInfo.length - 1].time 
      distance = runInfo[runInfo.length - 1].distance
      averageSpeed = distance/time
      averageSpeed = (averageSpeed * 3600).toFixed(4)
    } else {
      averageSpeed = 0
    }
    const snappedSpeed = Math.round(averageSpeed * 10)/10
    ghostSpeeds = new Array(5).fill(0).map((v, i) => {
      return snappedSpeed - .2 + i*.1
    })
  })
</script>

{#if averageSpeed > 0 }
  <table class="ghost-list-container">
    <tr>
      <th>Ghost Speed</th>
      <th>disatance</th>
      <th>lead</th>
      <th>catch time</th>
    </tr>
    {#each ghostSpeeds as ghostSpeed (ghostSpeed)}
      <LiveGhost {ghostSpeed} {time} {distance}/>
    {/each}
  </table>
{/if}

<style lang="scss">
  .ghost-list-container {
    margin: auto;
    width: calc(100% - 40px);
    padding: 10px;
    background-color: #fe88d2;
    border: 1px solid black;
    text-align: right;
  }
</style>
