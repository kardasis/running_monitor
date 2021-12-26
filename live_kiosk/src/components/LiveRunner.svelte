<script lang="typescript">
  export let time
  export let distance
</script>

<div class="runner-container">
  <div class="big">
    <span>{(distance / time * 3600).toFixed(3)}</span> mph
  </div>
  <div class="big">
    <span>{distance.toFixed(3)}</span> mi
  </div>
</div>

<style lang="scss">
  .runner-container {
    display: flex;
    flex-direction: row;
    & div {
      align-self: center;
      flex: 1;
    }
    font-size: 70px;
    background-color: white;
    margin: 5px;
    padding: 5px 20px;
    border: 1px solid black;
    border-radius: 40px;
  }
  .big {
    text-align: left;
    margin-left: 50px;
    & span {
      font-size: 120px;
    }
  }
</style>
