<script lang="ts">
  import Run from './Run.svelte'
  import RunSelector from './RunSelector.svelte'
  import api from '../utils/api'

  let activeRunName = ''
  let run = null
  $: api.getRun(activeRunName).then(res => {
    run = res
  })

</script>

<div class="explorer-container">
  <RunSelector bind:selectedRun={activeRunName} />
  {#if run}
    <Run {run}/>
  {/if}
</div>

<style lang="scss">
  .explorer-container {
    display: flex;
    flex-direction: row;
  }
</style>
