<template>
  <div class="dashboard">
    <Speed :speed="speed" :averageSpeed="averageSpeed"/>
    <div class="row">
      <div class="elapsed-time cell">
        <h1>{{ durationString }}</h1>
      </div>
      <div class="distance cell">
        <h1>{{ distanceString }}<span class="units">mi</span></h1>
      </div>
    </div>
    <div class="row">
      <div class="pace cell">
        <h1>pace: {{ pace }}<span class="units">min/mi</span></h1>
      </div>
      <div class="average-pace cell">
        <h1>avg pace:{{ averagePace }}<span class="units">min/mi</span></h1>
      </div>
    </div>
    <button class="start" v-if="!isRunning" v-on:click="start">Start</button>
    <button class="stop" v-if="isRunning" v-on:click="stop">Stop</button>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import { DateTime, Duration } from "luxon";
import Speed from "./Speed.vue";

type EventData = {
  speed: number;
  millis: string;
  incline: string;
  tickCount: number;
};

@Options({
  components: {
    Speed,
  },
  name: 'Dashboard'
})
export default class Dashboard extends Vue {
  eventData: EventData = {
    speed: 0,
    millis: "12345",
    incline: " - ",
    tickCount: 0,
  };
  state = "stopped";
  // connection = new WebSocket("ws://localhost:8081");
  connection = new WebSocket("ws://192.168.86.31:8081");
  runStartTime: DateTime = DateTime.now();
  currentTime = DateTime.now();

  get isRunning() {
    return this.state === "running";
  }
  get duration(): Duration {
    return this.currentTime.diff(this.runStartTime);
  }
  get durationString() {
    if (this.isRunning) {
      return this.currentTime.diff(this.runStartTime).toFormat("m:ss");
    } else {
      return " - ";
    }
  }
  get speed() {
    if (this.isRunning) {
      return this.eventData.speed.toLocaleString(undefined, {
        minimumFractionDigits: 2,
      });
    } else {
      return null;
    }
  }
  get distanceString() {
    if (this.isRunning) {
      return this.distance.toLocaleString(undefined, {
        minimumFractionDigits: 3,
      });
    } else {
      return null;
    }
  }
  get distance() {
    return this.eventData.tickCount / (2 * 5280);
  }
  get pace() {
    if (this.isRunning) {
      const millisecondsPerMile =  60 * 60 * 1000 / this.eventData.speed
      return Duration.fromMillis(millisecondsPerMile).toFormat("m:ss")
    } else {
      return null;
    }
  }
  get averageSpeed() {
    if (this.isRunning) {
      return (
        (60 * 60 * 1000 * this.distance) /
        this.duration.milliseconds
      ).toLocaleString(undefined, { minimumFractionDigits: 2 });
    } else {
      return null;
    }
  }
  get averagePace() {
    return this.duration.mapUnits((x) => x / this.distance).toFormat("m:ss");
  }

  refreshTime() {
    this.currentTime = DateTime.now();
  }
  stop() {
    console.log("Sending stop");
    this.connection.send(JSON.stringify({ message: "stop" }));
    this.state = "stopped";
  }
  start() {
    console.log("Sending start");
    this.connection.send(JSON.stringify({ message: "start" }));
    this.state = "running";
    this.runStartTime = DateTime.now();
  }
  created() {
    console.log("Starting connection to WebSocket Server");

    this.connection.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "dataPoint") {
        this.refreshTime();
        this.eventData = data.data;

      }
    };

    this.connection.onopen = function () {
      console.log("Connected to server");
    };
  }
}
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
  font-size: 20px;
}
h1 {
  margin: auto;
  text-align: center;
  font-size: 50px;
  color: blue;
}
.dashboard {
  display: flex;
  flex-direction: column;
}
.units {
  font-size: 30%;
}
</style>
