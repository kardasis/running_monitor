<template class="dash">
  <div class="row">
    <div class="current-mph cell">
      <h1>5.65<span class="units">mph</span></h1>
    </div>
  </div>
  <div class="row">
    <div class="elapsed-time cell">
      <h1>3:43</h1>
    </div>
    <div class="distance cell">
      <h1>3.998<span class="units">mi</span></h1>
    </div>
  </div>
  <div class="row">
    <div class="pace cell">
      <h1>9:34<span class="units">min/mi</span></h1>
    </div>
    <div class="average-speed cell">
      <h1>3.998<span class="units">mi</span></h1>
    </div>
    <div class="average-pace cell">
      <h1>10:43<span class="units">min/mi</span></h1>
    </div>
  </div>
  <button class="start" v-if="!isRunning" v-on:click="start">Start</button>
  <button class="stop" v-if="isRunning" v-on:click="stop">Stop</button>
</template>

<script>
export default {
  name: "Dashboard",
  props: {},
  data: function () {
    return {
      state: "stopped",
      connection: null,
    };
  },
  computed: {
    isRunning: function () {
      return this.state === "running";
    },
  },
  methods: {
    stop: function () {
      console.log("Sending stop");
      this.connection.send(JSON.stringify({message: 'stop'}));
      this.state = "stopped";
    },
    start: function () {
      console.log("Sending start");
      this.connection.send(JSON.stringify({message: 'start'}));
      this.state = "running";
    },
  },
  created: function () {
    console.log("Starting connection to WebSocket Server");
    this.connection = new WebSocket("ws://localhost:8081");
    // this.connection = new WebSocket("ws://192.168.86.31:8080");

    this.connection.onmessage = function (event) {
      console.log(event.data);
    };

    this.connection.onopen = function () {
      console.log("Connected to server");
    };
  },
};
</script>

<style scoped lang="scss">
html {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
button {
  margin: 20px;
  width: 200px;
  height: 50px;
  border: 1px solid #264b3c;
  border-radius: 15px;
  font-size: 20px;
  font-weight: 500;
  color: white;
  &.start {
    background-color: rgb(90, 179, 90);
  }
  &.stop {
    background-color: rgb(179, 90, 94);
  }
}
div.row {
  flex-direction: row;
  align-content: stretch;
}
div {
  flex: 1 1 0;
  display: flex;
  background-color: cornsilk;
  border-style: solid;
  border-width: 1px;
  border-color: darkgrey;
  &.current-mph > h1 {
      font-size: 150px;
    color: green;
  }
  &.elapsed-time > h1 {
    color: red;
  }
}
div.cell {
  padding: 6%;
}
h1 {
  margin: auto;
  text-align: center;
  font-size: 100px;
  color: blue;
}
.dash {
  display: flex;
  flex-direction: column;
}
.units {
  font-size: 30%;
}
</style>
