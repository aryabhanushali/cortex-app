import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BarChartSpecific = ({ dataset, title }) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!dataset || dataset.length === 0) return;

    const width = 800;
    const height = 600;
    const margin = { top: 50, right: 40, bottom: 50, left: 200 };

    d3.select(containerRef.current).select('svg').remove();

    const svg = d3.select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const xScale = d3.scaleLinear()
      .domain([-0.3, 1.5])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleBand()
      .domain(dataset.map(d => d.model))
      .range([margin.top, height - margin.bottom])
      .padding(0.2);

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
      .selectAll("text")
      .attr("class", "axis-label");

    // Background bar
    svg.selectAll(".background-bar")
      .data(dataset)
      .enter()
      .append("rect")
      .attr("class", "background-bar")
      .attr("x", xScale(-0.3))
      .attr("y", d => yScale(d.model) + yScale.bandwidth() * 0.25)
      .attr("width", d => xScale(d.pearsonr) - xScale(-0.3))
      .attr("height", 0.4 * yScale.bandwidth())
      .attr("fill", "#ddd");

    // Error bars (assuming fixed ±0.1 as in your original code)
    svg.selectAll(".error-bar")
      .data(dataset)
      .enter()
      .append("line")
      .attr("class", "error-bar")
      .attr("x1", d => xScale(d.pearsonr - 0.1))
      .attr("x2", d => xScale(d.pearsonr + 0.1))
      .attr("y1", d => yScale(d.model) + yScale.bandwidth() / 2)
      .attr("y2", d => yScale(d.model) + yScale.bandwidth() / 2)
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Dots
    svg.selectAll(".dot")
      .data(dataset)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.pearsonr))
      .attr("cy", d => yScale(d.model) + yScale.bandwidth() / 2)
      .attr("r", 5)
      .attr("fill", "steelblue");

    // Title
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("class", "model-label")
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(title);
  }, [dataset, title]);

  return (
    <div ref={containerRef}></div>
  );
};

export default BarChartSpecific;
