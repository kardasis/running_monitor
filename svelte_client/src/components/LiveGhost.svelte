<script lang="typescript">
  export let ghostSpeed
  export let time
  export let distance

  $: ghostDistance = ghostSpeed*time / 3600
</script>

<tr class="ghost-container">
  <td class="ghost-speed">
    <span>{ghostSpeed.toFixed(2)}</span> mph
  </td>
  <td>
    {ghostDistance.toFixed(3)}
  </td>
  <td>
    {(distance - ghostDistance).toFixed(3)}
  </td>
  <td>
    {((ghostDistance - distance)/(ghostSpeed - distance/time) * 3600).toFixed(0)} sec
  </td>
</tr>

<style lang="scss">
  .ghost-container {
    font-size: 30px;
  }
  .ghost-speed {
    width: 200px;
    & span {
    font-size: 50px;
    }
  }
</style>
