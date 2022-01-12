<script>
  import * as d3 from 'd3'
  import { afterUpdate } from 'svelte'
  import { durationString } from '../utils/time'
  export let data
  let chartDiv

  const margin = {top: 10, right: 30, bottom: 30, left: 30}

  afterUpdate(() => {
      const width = chartDiv.offsetWidth  - margin.right
      const height = 800 - margin.top - margin.bottom

      const weekStarts = Object.keys(data.weeks).map(k => {
          return data.weeks[k].weekStart
        }).sort()

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
        .domain([weekStarts[0], weekStarts[weekStarts.length - 1].plus({days: 7})])
        .range([margin.left, width - margin.right])
      svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x)
            .tickValues(Object.values(data.weeks).map(w => w.weekStart.toMillis()))
            .tickFormat(d3.timeFormat('%x')))

      // y-axis
      const bestMileYScale = d3.scaleLinear()
        .domain([0, d3.max(data.runs, r => r.bestDistances.oneMile.time )])
        .range([height - margin.bottom, margin.top])

      const y = d3.scaleLinear()
        .domain([0, d3.max(data.runs, r => r.totalDistance )])
        .range([height - margin.bottom, margin.top])
      svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y))


      // total miles per week
      for (let key in data.weeks) {
          const week = data.weeks[key]
          const weekStart = week.weekStart
          const weekEnd = weekStart.plus({days: 7})
          const rectX = x(weekStart.toMillis())
          const rectWidth = x(weekEnd.toMillis()) - rectX

          svg.append('rect')
            .attr('x', rectX)
            .attr('y', y(week.distance/7))
            .attr('width', rectWidth)
            .attr('height', y(0) - y(week.distance/7))
            .attr('stroke', 'white')
            .attr('fill', '#555')

          svg.append('text')
            .attr('x', rectX)
            .attr('y', y(week.distance/7) + 10)
            .attr("dy", "1em")
            .attr("dx", ".3em")
            .text(function(d) { return week.distance.toFixed(2) + ' mi'});
          svg.append('text')
            .attr('x', rectX)
            .attr('y', y(week.distance/7) + 10)
            .attr("dy", "2.2em")
            .attr("dx", ".3em")
            .text(function(d) { return week.calories.toFixed(0) + ' calories'});
          svg.append('text')
            .attr('x', rectX)
            .attr('y', y(week.distance/7) + 10)
            .attr("dy", "3.4em")
            .attr("dx", ".3em")
            .text(function(d) { return durationString(week.time)} );
        }

      svg.append('path')
        .datum(data.runs)
        .attr('stroke', 'red')
        .attr('fill', 'none')
        .attr('stroke-width', '2')
        .attr("d", d3.line()
            .x(function(d) { return x(d.startTime) })
            .y(function(d) { return y(d.totalDistance) })
          )

      svg.append('path')
        .datum(data.runs)
        .attr('stroke', 'green')
        .attr('fill', 'none')
        .attr('stroke-width', '3')
        .attr("d", d3.line()
            .x(function(d) { return x(d.startTime) })
            .y(function(d) { return bestMileYScale(d.bestDistances.oneMile.time) })
          )
    })
</script>

<div id="chart" bind:this={chartDiv}> </div>

<style>
  #chart {
    background-color: #000;
    border: 1px solid green;
    margin: 0px;
  }
</style>
