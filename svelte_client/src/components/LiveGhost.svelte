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
  .ghost-speed {
    width: 160px;
    & span {
    font-size: 30px;
    }
  }
</style>
