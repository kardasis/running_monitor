<script lang="ts">
  import TrendChart from './TrendChart.svelte'
  import api from '../utils/api'
  import { onMount } from 'svelte'
  let runs

  onMount(async () => {
      runs = await api.getRuns()
      runs.sort((a, b) => b.startTime - a.startTime)
  })

</script>

<main>
  {#if runs}
    <TrendChart data={runs} />
  {/if}
</main>

<style>
</style>
