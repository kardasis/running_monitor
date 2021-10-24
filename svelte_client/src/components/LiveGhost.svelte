<script lang="typescript">
  import { afterUpdate } from 'svelte'
  export let runInfo
  let averageSpeed
  let ghostSpeeds

  afterUpdate(() => {
    if (runInfo && runInfo.length > 0) {
        averageSpeed = runInfo[runInfo.length - 1].distance/runInfo[runInfo.length - 1].time 
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

<div class="ghost-container">
  {#if averageSpeed > 0 }
  {#each ghostSpeeds as ghostSpeed (ghostSpeed)}
    {ghostSpeed}
  {/each}
  {/if}
</div>

<style lang="scss">
  .ghost-container {
    background-color: #ccc;
    padding: 5px;
  }
</style>
