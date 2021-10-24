<script>
  import * as d3 from 'd3'
  import { onMount, afterUpdate } from 'svelte'
  export let run
  let chartDiv

  const margin = {top: 10, right: 30, bottom: 30, left: 30}

  afterUpdate(() => {
      const width = chartDiv.offsetWidth - margin.left - margin.right
      const height = 600 - margin.top - margin.bottom
      d3.select('#chart > *').remove()
      var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.top + margin.bottom)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

      // x-axis
      var x = d3.scaleLinear()
        .domain(d3.extent(run.data, t => t.time))
        .range([ 0, width ])
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickFormat(t => `${(t-t%60)/60}:${t%60}`)
          )

      // y-axis
      const y = d3.scaleLinear()
        .domain([0, d3.max(run.data, t => t.speed )])
        .range([ height, 0 ])
      svg.append("g")
        .call(d3.axisLeft(y))

      svg.append('path')
        .datum(run.data)
        .attr('stroke', 'black')
        .attr('fill', 'none')
        .attr("d", d3.line()
            .x(function(d) { return x(d.time) })
            .y(function(d) { return y(d.speed) })
          )
      svg.append('rect')
        .attr('x', x(run.maxRectangle.start))
        .attr('y', y(run.maxRectangle.height))
        .attr('width', x(run.maxRectangle.end - run.maxRectangle.start))
        .attr('height', y(0) - y(run.maxRectangle.height))
        .attr('stroke', 'white')
        .attr('fill', '#69a3b2')
    })
</script>

<div id="chart" bind:this={chartDiv}> </div>

<style>
  #chart {
    background-color: pink;
    border: 2px solid black;
    margin: 10px;
  }
</style>
