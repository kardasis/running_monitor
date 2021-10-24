<script>
  import Tab, { Label } from '@smui/tab';
  import TabBar from '@smui/tab-bar/styled'

  export let active = ''
</script>

<TabBar tabs={['live', 'explorer', 'trends']} let:tab bind:active>
      <Tab {tab}>
      <Label>{tab}</Label>
    </Tab>
</TabBar>

<style lang="scss">
  .tab-bar {
    display: flex;
    flex-direction: row;
    margin-bottom: 10px;
  }

  .tab {
    width: 300px;
    height: 35px;
    padding-top: 10px;
    background-color: white;
    border: 1px solid black;
    &.selected {
      background-color: black;
      color: white;
    }
  }
</style>
