<script>
  import RunSelectorButton from './RunSelectorButton.svelte'
  import api from '../utils/api'
  import { onMount } from 'svelte';

  export let selectedRun = ''
  export let runs = []

  const activateRun = (runId) => {
      selectedRun = runId
    }

  onMount(async () => {
      runs = await api.getRuns()
      runs.sort((a, b) => b.startTime - a.startTime)
      activateRun(runs[0].runId)
    })

  const refreshData = async () => {
      await api.reproessAllRuns()
    }

  const runClickedHandler = (run) => {
      selectedRun = run.runId
    }
</script>

<div class="container">
  <button on:click={(() => refreshData())}>Refresh</button>

  <div class="run-list">
    {#each runs as run (run)}
      <RunSelectorButton 
       run={run} 
       clickHandler={runClickedHandler}
       selected={selectedRun == run.runId} />
    {/each}
  </div>
</div>

<style lang="scss">
  .container{
    display: flex;
    flex-direction: column;
  }
  .run-list{
    height: 800px;
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    width: 500px;
    border: 1px solid grey;
    padding: 0px;
  }
</style>
