import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const RoiHeatChart = ({ dataset, title }) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!dataset || dataset.length === 0) return;

    const width = window.innerWidth * 0.9;
    const height = window.innerHeight * 0.8;
    const margin = { top: 40, right: 150, bottom: 100, left: 250 };
    const baseFontSize = Math.min(width, height) * 0.02;

    
    const models = Array.from(new Set(dataset.map(d => d.model)));
    const desiredOrder = ["Overall", "PPA", "FFA", "EBA"];

    const actualROIs = new Set(dataset.map(d => d.roi));
    const rois = desiredOrder.filter(roi => actualROIs.has(roi));

    d3.select(containerRef.current).select('svg').remove();
    const rowHeight = 25;
    const chartHeight = models.length * rowHeight;
    const totalHeight = chartHeight + margin.top + margin.bottom;

    const columnWidth = 180;
    const chartWidth = rois.length * columnWidth ;
    const totalWidth = chartWidth + margin.left + margin.right;
    const columnGap = 3;
    const rowGap = 3;
    
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', totalHeight);

    
    const xScale = d3.scaleOrdinal()
        .domain(rois)
        .range(rois.map((_, i) => margin.left + i * (columnWidth + columnGap)));

    const xAxisHeight = 30;
    const yScale = d3.scaleOrdinal()
        .domain(models)
        .range(models.map((_, i) => margin.top + xAxisHeight + i * (rowHeight + rowGap)));
    

    const colorScale = d3.scaleSequential()
      .domain([-0.3, 0.8])
      .interpolator(d3.interpolateBlues);

    const xAxis = svg.append('g')
      .attr('transform', `translate(0, ${margin.top})`)
      .call(d3.axisBottom(xScale));

    xAxis.select('.domain').remove();
    xAxis.selectAll('line').remove();

    xAxis.selectAll('text')
      .attr('transform', `translate(${columnWidth / 2}, 0)`)
      .attr('class', 'axis-label clickable')
      .style('cursor', 'pointer')
      .style('font-size', `${baseFontSize * 1.2}px`)
      .style('fill', '#000')  
      .style('font-weight', 'bold') 

    

    const yAxis = svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

    yAxis.select('.domain').remove();
    yAxis.selectAll('line').remove();

    yAxis.selectAll('text')
      .attr('transform', `translate(0, ${rowHeight / 2})`)
      .attr('class', 'axis-label clickable')
      .style('cursor', 'pointer')
      .style('font-size', `${baseFontSize * 1.2}px`)
      .style('fill', '#000') 
      .style('font-weight', 'bold')

    const cells = svg.selectAll('.heatmap-cell')
      .data(dataset)
      .enter()
      .append('g')
      .attr('class', 'heatmap-cell')
      .attr('transform', d => `translate(${xScale(d.roi)}, ${yScale(d.model)})`);

    cells.append('rect')
      .attr('width', columnWidth)
      .attr('height', rowHeight)
      .attr('fill', d => colorScale(d.pearsonr));

    cells.append('text')
      .attr('x', columnWidth / 2)
      .attr('y', rowHeight / 2)
      .attr('dy', '.35em')
      .attr('text-anchor', 'middle')
      .attr('fill', 'white')
      .style('font-size', `${baseFontSize * 1.5}px`)
      .text(d => d.pearsonr.toFixed(2));

    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 30)
      .attr('text-anchor', 'middle')
      .style('font-size', `${baseFontSize * 1.5}px`)
      .style('font-weight', 'bold')
      .text(title);
  }, [dataset, title]);

  return <div ref={containerRef}></div>;
};

export default RoiHeatChart;
