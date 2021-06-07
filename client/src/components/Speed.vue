<template>
  <div class="cell">
    <div class="speed">
      <h1>{{ speed }}</h1>
    </div>
    <div class="average">
      <h1>avg: {{ averageSpeed }} mph</h1>
    </div>
  </div>
</template>


<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  props: {
    speed: String,
    averageSpeed: String,
  },
  name: "Speed",
})
export default class Speed extends Vue {}
</script>

<style scoped lang="scss">
h1 {
  margin: auto;
  text-align: center;
  color: blue;
}
div.speed {
  font-size: 50px;
}
div.average {
  font-size: 20px;
}
div.cell {
  display: flex;
  flex-direction: column;
}

</style>
