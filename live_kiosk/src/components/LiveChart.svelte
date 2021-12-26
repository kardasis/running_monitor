<script>
  import * as d3 from 'd3'
  import { onMount, afterUpdate } from 'svelte'
  export let runInfo
  let chartDiv

  const margin = {top: 10, right: 30, bottom: 30, left: 30}
  let totalHeight, width, height

  onMount(() => {
      totalHeight = 200
      width = chartDiv.offsetWidth - margin.left - margin.right
      height = totalHeight - margin.top - margin.bottom
    })

  afterUpdate(() => {
      const windowedRunInfo = runInfo.slice(-600)

      d3.select('#chart > *').remove()
      var svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", totalHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

      // x-axis
      const domain = d3.extent(windowedRunInfo, t => t.time )
      /* domain[0] = Math.max(domain[1], totalHeight) */
      var x = d3.scaleLinear()
        .domain(domain)
        .range([ 0, width ])
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x)
            .tickFormat(t => {
                const s = t % 60
                return `${(t - s)/60}:${parseInt(s).toString().padStart(2, '0')}`
              })
          )

      // y-axis
      const y = d3.scaleLinear()
        .domain([0, d3.max(windowedRunInfo, t => t.speed )])
        .range([ height, 0 ])
      svg.append("g")
        .call(d3.axisLeft(y))

      svg.append('path')
        .datum(windowedRunInfo)
        .attr('stroke', 'none')
        .attr('fill', '#ccc')
        .attr("d", d3.area()
            .x(function(d) { return x(d.time) })
            .y0(y(0))
            .y1(function(d) { return y(d.speed) })
          )
    })
</script>

<div id="chart" bind:this={chartDiv}> </div>

<style>
  #chart {
    background-color: #eee;
    border: 1px solid black;
    border-radius: 20px;
    margin: 0 10px;
    flex: 1;
    padding: 0 20px;
  }
</style>
