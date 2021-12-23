<script>
  import * as d3 from 'd3'
  import { afterUpdate } from 'svelte'
  export let data
  let chartDiv

  const margin = {top: 10, right: 30, bottom: 30, left: 30}

  afterUpdate(() => {
      const width = chartDiv.offsetWidth - margin.left - margin.right
      const height = 300 - margin.top - margin.bottom
      d3.select('#chart > *').remove()
      var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

      // x-axis
      var x = d3.scaleLinear()
        .domain(d3.extent(data, r => r.startTime))
        .range([ 0, width])
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%b')))

      // y-axis
      const y = d3.scaleLinear()
        .domain([0, d3.max(data, r => r.totalDistance )])
        .range([ height, 0 ])
      svg.append("g").call(d3.axisLeft(y))

      svg.append('path')
        .datum(data)
        .attr('stroke', 'black')
        .attr('fill', 'none')
        .attr("d", d3.line()
            .x(function(d) { return x(d.startTime) })
            .y(function(d) { return y(d.totalDistance) })
          )
    })
</script>

<div id="chart" bind:this={chartDiv}> </div>

<style>
  #chart {
    background-color: pink;
    border: 1px solid black;
    margin: 10px;
  }
</style>
