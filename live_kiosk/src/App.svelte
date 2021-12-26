<script lang="ts">
  import Live from './components/Live.svelte'
</script>

<main>
  <Live />
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
