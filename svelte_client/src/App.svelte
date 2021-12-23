<script lang="ts">
  import TabBar from './components/TabBar.svelte'
  import Explorer from './components/Explorer.svelte'
  import Trends from './components/Trends.svelte'
  import Live from './components/Live.svelte'

  let selectedTab = 'live'
</script>

<main>
  <TabBar bind:active={selectedTab} />
  {#if selectedTab === 'explorer'}
    <Explorer />
  {:else if selectedTab === 'trends'}
    <Trends />
  {:else if selectedTab === 'live'}
    <Live />
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
  }
  :global(html){
    height: 100%;
  }

</style>
