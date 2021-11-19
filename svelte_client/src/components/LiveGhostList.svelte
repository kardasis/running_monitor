<script lang="typescript">
  import LiveGhost from './LiveGhost.svelte'
  import LiveRunner from './LiveRunner.svelte'
  import { afterUpdate } from 'svelte'
  import { flip } from 'svelte/animate';


  export let runInfo

  let averageSpeed, time, distance, ghostSpeeds, currentSpeed


  afterUpdate(() => {
    if (runInfo && runInfo.length > 1) {
      time = runInfo[runInfo.length - 1].time 
      distance = runInfo[runInfo.length - 1].distance
      averageSpeed = distance/time
      averageSpeed = (averageSpeed * 3600).toFixed(4)
      currentSpeed = runInfo[runInfo.length - 1].speed
    } else {
      averageSpeed = 0
    }

  })
  const trailingGhostCount = 2, leadingGhostCount = 4
  $: floor = Math.floor(averageSpeed * 10) / 10
  $: ceil = floor + .1
  $: trailingGhostSpeeds = Array(trailingGhostCount + 1).fill(0).map((v, i) => {
      return floor - trailingGhostCount * .1 + i*.1
   })
  $: leadingGhostSpeeds = Array(leadingGhostCount + 1).fill(0).map((v, i) => {
      return ceil + i*.1
   })
  $: ghostSpeeds = trailingGhostSpeeds.concat(['x'], leadingGhostSpeeds)
  const flipOptions = { duration: 500};

  function ghostSpeedKey(s) {
    if (s === 'x') return s
    return s.toFixed(2)
    }
</script>

{#if averageSpeed > 0 }
  <div class="ghost-list-container">
    {#each ghostSpeeds as ghostSpeed (ghostSpeedKey(ghostSpeed))}
      <div animate:flip={flipOptions} class="container {ghostSpeed==='x' ? 'live-runner' : 'live-ghost'}">
        {#if (ghostSpeed === 'x')}
          <LiveRunner {time} {distance}  />
        {:else}
          <LiveGhost {ghostSpeed} {time} {distance} {currentSpeed}/>
        {/if}
      </div>
    {/each}
  </div>
{/if}

<style lang="scss">
  .ghost-list-container {
    & div {
      align-self: center;
      width: 100%;
      position: relative;
      top: -106px;
    }
    display: flex;
    flex-direction: column;
    flex: 1;
    margin: 20px;
    width: calc(100% - 102px);
    padding: 5px 30px;
    background-color: #f8f8f8;
    border-radius: 10px;
    border: 1px solid #ccc;
    text-align: right;
    overflow: hidden;
    min-height: 665px;
  }
  .live-runner {
    z-index: 2;
  }
</style>
