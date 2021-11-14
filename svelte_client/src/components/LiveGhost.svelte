<script lang="typescript">
  export let ghostSpeed
  export let time
  export let distance
  export let currentSpeed

  $: ghostDistance = ghostSpeed*time / 3600
  $: catchTime = ((ghostDistance - distance)/(currentSpeed - ghostSpeed) * 3600).toFixed(0)
</script>

<div class="ghost-container">
  <div class="ghost-speed">
    <span>{ghostSpeed.toFixed(2)}</span> mph
  </div>
  <div>
    {ghostDistance.toFixed(3)}
  </div>
  <div>
    {(ghostDistance - distance).toFixed(3)}
  </div>
  <div>
    {catchTime > 0 ? `${catchTime}s` : '--'}
  </div>
</div>

<style lang="scss">
  .ghost-container {
    background-color: lightgrey;
    margin: 5px auto;
    padding: 2px 20px;
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
  }
</style>
