<script lang="ts">
  import Run from './Run.svelte'
  import RunSelector from './RunSelector.svelte'
  import api from '../utils/api'

  let activeRunName = ''
  let runs = []
  let run = null
  $: api.getRunData(activeRunName).then(res => {
    if (!res) return null
    run = {...runs.find(run => run.runId === activeRunName), data: res}
  })

</script>

<div class="explorer-container">
  <RunSelector bind:selectedRun={activeRunName} bind:runs={runs}/>
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
