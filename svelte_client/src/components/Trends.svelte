<script lang="ts">
  import TrendChart from './TrendChart.svelte'
  import api from '../utils/api'
  import { onMount } from 'svelte'
  import { DateTime } from "luxon";

  let data

  onMount(async () => {
      const runs = await api.getRuns()
      runs.sort((a, b) => a.startTime - b.startTime)

      const times = runs.map(r => new DateTime(r.startTime))
      const weeks = {}
      runs.forEach(r => {
        const weekTime = DateTime.fromMillis(r.startTime).startOf('week')
        const week = weeks[weekTime] || {distance: 0, calories: 0, time: 0, weekStart: weekTime}
        week.distance += r.totalDistance
        week.calories += r.totalCalories
        week.time += r.totalTime
        weeks[weekTime] = week
      })
      data = { runs, weeks }
  })

</script>

<main>
  {#if data}
    <TrendChart data={data} />
  {/if}
</main>

<style>
</style>
