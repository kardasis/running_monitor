<script>
  export let active = ''

  const selectTab = (name) => {
      console.log(name)
      active = name
    }
</script>

<div class="bar">
  <button on:click={() => selectTab('explorer')}>Explorer</button>
  <button on:click={() => selectTab('trends')}>Trends</button>
</div>

<style lang="scss"></style>
