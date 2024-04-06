import './style.css'
import * as d3 from "d3";

const req = new XMLHttpRequest();
req.open("GET", 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json', true);
req.send();
req.onload = function () {
  const json = JSON.parse(req.responseText);
  const monthlyVarianceData = json.monthlyVariance;

  const baseTemperature = json.baseTemperature;

  const windowWidth = window.innerWidth;

  const padding = 60;

  const w = windowWidth - (padding * 2);

  const h = w / 2.5;

  d3.select('#app')
    .append('h1')
    .attr('id', 'title')
    .text('Monthly Global Land-Surface Temperature');

  d3.select('#app')
    .append('h3')
    .attr('id', 'description')
    .text('1753 - 2015: base temperature ' + baseTemperature + '\u00B0 C');

  const svg = d3.select('#app')
    .append('svg')
    .attr('id', 'mainSvg')
    .attr('width', w)
    .attr('height', h - padding);

  /////////AXES//////////
  const xScale = d3.scaleTime()
    .domain([d3.min(monthlyVarianceData, (d) => new Date(d.year, 0).getFullYear()), d3.max(monthlyVarianceData, (d) => new Date(d.year, 0).getFullYear() + 1)])
    .range([(padding * 2), w]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const yScaleDomain = monthlyVarianceData.map((x) => new Date(0, x.month - 1)).slice(0, 12).reverse().map((date) => date.getMonth());

  const yScale = d3.scaleBand()
    .domain(yScaleDomain)
    .range([h - (padding * 2), 0]);

  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d')).ticks(26);

  const yAxis = d3.axisLeft(yScale).tickFormat((monthValue) => monthNames[monthValue]);

  svg.append("g")
    .attr("transform", "translate(0," + (h - (padding * 2)) + ")")
    .attr('id', 'x-axis')
    .call(xAxis);

  svg.append("g")
    .attr("transform", "translate(" + (padding * 2) + ", 0)")
    .attr('id', 'y-axis')
    .call(yAxis);

  svg.append("text")
    .attr('class', 'legendText')
    .attr("transform", "rotate(-90)")
    .attr('x', -(h / 2) + padding)
    .attr('y', 0)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Months");

  svg.append("text")
    .attr('class', 'legendText')
    .attr('x', w / 2)
    .attr('y', h - (padding))
    .attr("dy", "-1em")
    .style("text-anchor", "middle")
    .text("Years");

  //////////LEGEND//////////

  const minTemperature = Math.round(((baseTemperature + d3.min(monthlyVarianceData, (d) => (d.variance))) * 10)) / 10;

  const maxTemperature = Math.round(((baseTemperature + d3.max(monthlyVarianceData, (d) => (d.variance))) * 10)) / 10;

  const squareData = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];

  const legendTicks = ['0', '1', '2', '3', '4', '5', '6', '7', '8'].map((x) => Math.round((minTemperature + (x * 1.53)) * 10) / 10);

  const legendColors = ['#1B4F72', '#2874A6', '#2E86C1', '#AED6F1', '#FFF700', '#FF6700', '#FD1C03', '#990012'];

  const legendScale = d3.scaleLinear()
    .domain([minTemperature, maxTemperature])
    .range([(padding * 2), (w / 3)])

  const legendAxis = d3.axisBottom(legendScale).tickValues(legendTicks).tickFormat(d3.format(".1f"));

  const squareDimension = Math.round((((w / 3) - (padding * 2)) / 8) * 10) / 8;

  const legendSvg = d3.select('#app')
    .append('svg')
    .attr('id', 'legend')
    .style('width', w)
    .style('height', padding);

  legendSvg.append('g')
    .attr('transform', 'translate(0,' + (padding * (2 / 3)) + ')')
    .attr('x', '20')
    .attr('id', 'legendAxis')
    .call(legendAxis);

  legendSvg.selectAll('rect')
    .data(legendColors)
    .enter()
    .append('rect')
    .attr('class', 'legendSquare')
    .attr('height', squareDimension - 15)
    .attr('width', (d, i) => legendScale(Math.round((minTemperature + ((i + 1) * 1.53)) * 10) / 10) - legendScale(Math.round((minTemperature + (i * 1.53)) * 10) / 10))
    .attr('x', (d, i) => legendScale(Math.round((minTemperature + (i * 1.53)) * 10) / 10))
    .attr('y', padding * (2 / 3) - (squareDimension - 15))
    .style('fill', (d) => d)

  //////////RECT//////////

  const rectWidth = w / (monthlyVarianceData.length / 12);

  const rectHeight = ((h - padding * 2) / 12);

  svg.selectAll('rect')
    .data(monthlyVarianceData)
    .enter()
    .append('rect')
    .attr('id', (d, i) => i)
    .attr('class', 'cell')
    .attr('data-month', (d) => new Date(0, d.month - 1).getMonth())
    .attr('data-year', (d) => new Date(d.year, 0).getFullYear())
    .attr('data-temp', (d) => Math.round((baseTemperature + d.variance) * 10) / 10)
    .attr('data-fill', (d, i) => {
      const dataTemp = document.getElementById(i).getAttribute('data-temp');
      let index = 7;
      if (dataTemp >= 1.7 && dataTemp < 3.2) {
        index = 0;
      } else if (dataTemp >= 3.2 && dataTemp < 4.8) {
        index = 1;
      } else if (dataTemp >= 4.8 && dataTemp < 6.3) {
        index = 2;
      } else if (dataTemp >= 6.3 && dataTemp < 7.8) {
        index = 3;
      } else if (dataTemp >= 7.8 && dataTemp < 9.4) {
        index = 4;
      } else if (dataTemp >= 9.4 && dataTemp < 10.9) {
        index = 5;
      } else if (dataTemp >= 10.9 && dataTemp < 12.4) {
        index = 6;
      } else if (dataTemp > 12.4) {
        index = 7;
      }
      return legendColors[index]
    })
    .attr('width', rectWidth)
    .attr('height', (d) => rectHeight)
    .attr('x', (d, i) => xScale(new Date(d.year, 0).getFullYear()))
    .attr('y', (d) => yScale(new Date(0, d.month - 1).getMonth()))
    .style('fill', (d, i) => {
      const dataTemp = document.getElementById(i).getAttribute('data-temp');
      let index = 7;
      if (dataTemp >= 1.7 && dataTemp < 3.2) {
        index = 0;
      } else if (dataTemp >= 3.2 && dataTemp < 4.8) {
        index = 1;
      } else if (dataTemp >= 4.8 && dataTemp < 6.3) {
        index = 2;
      } else if (dataTemp >= 6.3 && dataTemp < 7.8) {
        index = 3;
      } else if (dataTemp >= 7.8 && dataTemp < 9.4) {
        index = 4;
      } else if (dataTemp >= 9.4 && dataTemp < 10.9) {
        index = 5;
      } else if (dataTemp >= 10.9 && dataTemp < 12.4) {
        index = 6;
      } else if (dataTemp > 12.4) {
        index = 7;
      }
      return legendColors[index]
    });

  //////////TOOLTIP//////////

  d3.select('body')
    .append('div')
    .attr('id', 'tooltip')
    .attr('style', 'position: absolute; opacity: 0; background: black')
    .append('p')
    .attr('id', 'tooltip-date')
    .attr('class', 'tooltipText');

  d3.select('#tooltip')
    .append('p')
    .attr('id', 'tooltip-temp')
    .attr('class', 'tooltipText');

  d3.select('#tooltip')
    .append('p')
    .attr('id', 'tooltip-temperature-change')
    .attr('class', 'tooltipText');

  d3.select('#mainSvg')
    .selectAll('rect')
    .data(monthlyVarianceData)
    .join('rect')

    .on("mouseover", function (event, d) {
      const [x, y] = d3.pointer(event);
      const temperature = Math.round((baseTemperature + d.variance) * 10) / 10;
      const year = d.year;
      const month = monthNames[d.month - 1];
      let change = Math.round((temperature - baseTemperature) * 10) / 10 + '\u00B0 C';
      let theColor = document.getElementById(event.srcElement.id).getAttribute('data-fill');


      d3.select(this)
        .attr("stroke", "black")
        .attr("stroke-width", 2)
        .attr('cursor', 'pointer');

      d3.select("#tooltip")
        .attr('data-year', (f) => document.getElementById(event.srcElement.id).getAttribute('data-year'));

      d3.select('#tooltip-date')
        .text(year + ' - ' + month)
        .style('color', theColor);

      d3.select('#tooltip-temp')
        .text(temperature + '\u00B0 C')
        .style('color', theColor);

      d3.select('#tooltip-temperature-change')
        .text(change)
        .style('color', theColor);
    })
    .on("mouseout", function () {
      d3.select(this)
        .attr("stroke", "none");

      d3.select("#tooltip")
        .style("opacity", 0);
    })
    .on('mousemove', (event) => {
      const [x, y] = d3.pointer(event);

      d3.select("#tooltip")
        .style("opacity", 1)
        .style("left", x + "px")
        .style("top", y + 30 + "px");

    });
};