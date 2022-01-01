<script lang="ts">
  import TabBar from './components/TabBar.svelte'
  import Explorer from './components/Explorer.svelte'
  import Trends from './components/Trends.svelte'

  let selectedTab = 'trends'
</script>

<main>
  <TabBar bind:active={selectedTab} />
  {#if selectedTab === 'explorer'}
    <Explorer />
  {:else if selectedTab === 'trends'}
    <Trends />
  {/if}
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    text-align: center;
    margin: 0 auto;
    height: 100%;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
  :global(body){
    height: 100%;
    background-color: black;
  }
  :global(html){
    height: 100%;
  }

</style>
