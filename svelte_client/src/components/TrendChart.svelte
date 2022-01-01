<script>
  import * as d3 from 'd3'
  import { afterUpdate } from 'svelte'
  export let data
  let chartDiv

  const margin = {top: 10, right: 30, bottom: 30, left: 30}

  afterUpdate(() => {
      const width = chartDiv.offsetWidth - margin.left - margin.right
      const height = 800 - margin.top - margin.bottom
      d3.select('#chart > *').remove()
      var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height + margin.top + margin.bottom)
        .attr('stroke', 'white')
        .attr('fill', '#dddddd')
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

      // x-axis
      var x = d3.scaleLinear()
        .domain(d3.extent(data.runs, r => r.startTime))
        .range([ 0, width])
      console.log(Object.values(data.weeks).map(w => x(w.weekStart.toMillis())))
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickValues(Object.values(data.weeks).map(w => w.weekStart.toMillis()))
            .tickFormat(d3.timeFormat('%x')))

      // y-axis
      const y = d3.scaleLinear()
        .domain([0, d3.max(data.runs, r => r.totalDistance )])
        .range([ height, 0 ])
      svg.append("g").call(d3.axisLeft(y))
      for (let key in data.weeks) {
          const week = data.weeks[key]
          const weekStart = week.weekStart
          const weekEnd = weekStart.plus({days: 7})
          const rectX = d3.max([x(weekStart.toMillis()), x(data.runs[0].startTime)])
          const rectWidth = x(weekEnd.toMillis()) - rectX
          svg.append('rect')
            .attr('x', rectX)
            .attr('y', y(week.distance/7))
            .attr('width', rectWidth)
            .attr('height', y(0) - y(week.distance/7))
            .attr('stroke', 'white')
            .attr('fill', '#555')
        }

      svg.append('path')
        .datum(data.runs)
        .attr('stroke', 'red')
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
    background-color: #000;
    border: 1px solid green;
    margin: 10px;
  }
</style>
