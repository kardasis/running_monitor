<script lang="ts">
  import TabBar from './components/TabBar.svelte'
  import Explorer from './components/Explorer.svelte'
  import Live from './components/Live.svelte'

  let selectedTab = 'live'
</script>

<main>
  <TabBar bind:active={selectedTab} />
  {#if selectedTab === 'explorer'}
    <Explorer />
  {:else if selectedTab === 'trends'}
    trends
  {:else if selectedTab === 'live'}
    <Live />
  {/if}
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    text-align: center;
    padding: 1em;
    max-width: 240px;
    margin: 0 auto;
  }

  @media (min-width: 640px) {
    main {
      max-width: none;
    }
  }
</style>
