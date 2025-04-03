import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const HeatChartOverall = ({ dataset, title}) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!dataset || dataset.length === 0) return;

    const width = window.innerWidth ;
    const height = window.innerHeight;
    const margin = { top: 30, right: 250, bottom:30, left: 250 };

    const baseFontSize = Math.min(width, height) * 0.02;

    const models = Array.from(new Set(dataset.map(d => d.model)));
    const datasets = Array.from(new Set(dataset.map(d => d.dataset)));

    d3.select(containerRef.current).select('svg').remove();
    const rowHeight = 30;
    const chartHeight = models.length * rowHeight;
    const totalHeight = chartHeight + margin.top + margin.bottom;

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', totalHeight);

    

    

    const xScale = d3.scaleBand()
      .domain(datasets)
      .range([margin.left, width - margin.right])
      .padding(0.05);

    const xAxisHeight = 30;
    const yScale = d3.scaleBand()
      .domain(models)
      .range([margin.top + xAxisHeight, chartHeight + margin.top])
      .padding(0.05);

    const colorScale = d3.scaleSequential()
      .domain([-0.3, 0.8])
      .interpolator(d3.interpolateBlues);

    const xAxis = svg.append('g')
      .attr('transform', `translate(0, ${margin.top})`)
      .call(d3.axisBottom(xScale));

    xAxis.select('.domain').remove();
    xAxis.selectAll('line').remove();

    xAxis.selectAll('text')
      .attr('class', 'axis-label clickable')
      .style('cursor', 'pointer')
      .style('font-size', `${baseFontSize*1.2}px`)
      .style('fill', '#000')  // 黑色
      .style('font-weight', 'bold') // 加粗

    const yAxis = svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));
    
    yAxis.select('.domain').remove();
    yAxis.selectAll('line').remove();

    yAxis.selectAll('text')
      .attr('class', 'axis-label clickable')
      .style('cursor', 'pointer')
      .style('font-size', `${baseFontSize*1.2}px`)
      .style('fill', '#000')  // 黑色
      .style('font-weight', 'bold') // 加粗

    const cells = svg.selectAll('.heatmap-cell')
      .data(dataset)
      .enter()
      .append('g')
      .attr('class', 'heatmap-cell')
      .attr('transform', d => `translate(${xScale(d.dataset)}, ${yScale(d.model)})`);

    cells.append('rect')
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', d => colorScale(d.pearsonr));

    cells.append('text')
      .attr('x', xScale.bandwidth() / 2)
      .attr('y', yScale.bandwidth() / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('font-size', `${baseFontSize * 1.5}px`)

      .text(d => d.pearsonr.toFixed(2));

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('class', 'model-label')
      .attr('text-anchor', 'middle')
      .style('font-size', `${baseFontSize * 1.5}px`)
      .style('fill', '#000') 
      .style('font-weight', 'bold') 
      .text(title);
  }, [dataset, title]);

  return (
    <div className="overallchart" ref={containerRef}></div>
  );
};

export default HeatChartOverall;
