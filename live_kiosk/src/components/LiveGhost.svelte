<script lang="typescript">
  import {FEET_PER_MILE} from '../utils/constants.ts'
  export let ghostSpeed
  export let time
  export let distance
  export let currentSpeed

  $: ghostDistance = ghostSpeed*time / 3600
  $: catchTime = ((ghostDistance - distance)/(currentSpeed - ghostSpeed) * 3600).toFixed(0)
</script>

<div class="ghost-container">
  <div class="ghost-speed">
    <span>{ghostSpeed.toFixed(2)}</span> <span class="units"> mph</span>
  </div>
  <div>
    {((ghostDistance - distance)*FEET_PER_MILE).toFixed(0)}<span class="units"> ft</span>
  </div>
  <div>
    {catchTime} <span class="units"> s</span>
  </div>
</div>

<style lang="scss">
  .units {
    font-size: 30px;
  }
  .ghost-container {
    background-color: lightgrey;
    margin: 2px auto;
    padding: 1px 20px;
    width: 80%;
    border: 1px solid grey;
    border-radius: 30px;
    display: flex;
    flex-direction: row;
    & div {
      align-self: center;
      flex: 1;
    }
    font-size: 50px;
  }
  .ghost-speed {
    & span {
      font-size: 80px;
    }
    .units {
      font-size: 30px;
    }
  }
</style>
