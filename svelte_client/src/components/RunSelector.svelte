<script>
  import api from '../utils/api'
  import { onMount } from 'svelte';

  export let selectedRun = ''
  export let runs = []

  const activateRun = (name) => {
      selectedRun = name
    }

  onMount(async () => {
      runs = await api.getRuns()
      activateRun(runs[0])
    })

  const displayTime = (name) => {
      const timestamp = name.split('-')[1].split('.')[0]
      const res = new Date(0)
      res.setUTCSeconds(timestamp/1000)
      return res.toDateString() + res.toLocaleTimeString()
    }
</script>

<div class="container">
  <div class="run-list">
    {#each runs as runName (runName)}
      <button 
       class="run-button {runName === selectedRun ? 'selected' : ''}" 
       on:click={() => activateRun(runName)}>
       {@html displayTime(runName)}
      </button>
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
    width: 300px;
    border: 1px solid grey;
    padding: 0px;
  }
  .run-button{
    border-width: 0px 0px 1px;
    background-color: #ffffdd;
    margin: 0;
    padding: 5px 20px;
    &:hover {
      background-color: lightgrey;
    }
    &.selected {
      background-color: #eee;
    }
  }
</style>
