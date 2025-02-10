import * as d3 from 'd3';

export const barchartStyles = {
  margin: { top: 20, right: 30, bottom: 20, left: 50 },
  barColor: "steelblue", // Default bar color
  barHoverColor: "orange", // Bar color on hover
  axisColor: "#000", // Axis stroke color
  strokeWidth: 1, // Axis stroke width
};

export const createYScale = (maxValue, innerHeight) => 
  d3.scaleLinear().domain([0, maxValue]).range([innerHeight, 0]);

export const createXScale = (categories, innerWidth) => 
  d3.scaleBand().domain(categories).range([0, innerWidth]).padding(0.1);

export const styleTooltip = (tooltip) => {
  tooltip
    .style("position", "absolute")
    .style("background", "#fff")
    .style("border", "1px solid #ccc")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("box-shadow", "0 2px 4px rgba(0, 0, 0, 0.2)")
    .style("font-size", "14px")
    .style("display", "none")
    .style("z-index", "9999") // High z-index to hover over all components
    .style("pointer-events", "none") // Prevent tooltip from blocking mouse events
};
