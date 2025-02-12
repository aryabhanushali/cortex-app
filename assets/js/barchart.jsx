import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { interpolateRdBu } from "d3-scale-chromatic";
import { barchartStyles, createXScale, createYScale, styleTooltip } from './barchartstyles';

const BarChart = ({ barChartData, height, fileMappings}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const [order, setOrder] = useState("filename"); 

  // Update container width dynamically
  useEffect(() => {

    setTimeout(() => {
      document.querySelectorAll('.tooltip').forEach((el) => {
        el.style.opacity = "1";
        el.style.visibility = "visible";
      });
    }, 100);

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);


  const getSortedData = () => {
    if (!barChartData) return [];  // If no data, return an empty array.
  
    if (order === "filename") {
      return barChartData; // Use original order, no sorting needed.
    } else if (order === "ranking") {
      return [...barChartData].sort((a, b) => b.mean - a.mean); // Sort by mean descending.
    }
  
    return barChartData; // Default case: return as-is.
  };
  

  const getBlobURL = (filename) => {
    const mapping = fileMappings?.find(mapping => mapping.file.name === filename);
    return mapping ? mapping.blobURL : null;
  };



  useEffect(() => {

    const barChartData = getSortedData();

    if (!barChartData || barChartData.length === 0) {
      console.warn(" No barchart data available, skipping rendering.");
      return;
    }
    console.log("✅ Rendering Barchart with Data:", barChartData);

    // Clear existing content
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = barchartStyles.margin;
    const width = containerWidth; // Use dynamic container width
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = createXScale(barChartData.map((d) => d.filename), innerWidth);

    const yMin = d3.min(barChartData, (d) => d.mean);
    const yMax = d3.max(barChartData, (d) => d.mean);
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]);

    const colorScale = d3.scaleSequential(interpolateRdBu)  // Or another scheme
    .domain([yMax, yMin]); // Maps values from min to max

    // Append group to SVG
    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    let tooltip = d3.select(containerRef.current).select(".tooltip");
    if (tooltip.empty()) {
      tooltip = d3.select(containerRef.current)
        .append("div")
        .attr("class", "tooltip");
    }
    styleTooltip(tooltip);

    // Draw bars
    g.selectAll(".bar")
    .data(barChartData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => xScale(d.filename))
    .attr("y", (d) => (d.mean >= 0 ? yScale(d.mean) : yScale(0)))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => Math.abs(yScale(d.mean) - yScale(0)))
    .attr("fill", (d) => colorScale(d.mean))  // Dynamic color from D3 scale
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget).attr("fill", d3.color(colorScale(d.mean)).darker(0.5));

      // const imagePath = `/assets/data/images_185/${d.filename}`;
      const blobURL = getBlobURL(d.filename);
      console.log('Showing image:', blobURL);

      tooltip
        .html(
          `<div>
            <p><strong>Filename:</strong> ${d.filename}</p>
            <p><strong>Mean:</strong> ${d.mean.toFixed(4)}</p>
            <p><strong>SEM:</strong> ${d.sem.toFixed(4)}</p>
            <img src="${blobURL}" alt="Thumbnail" 
            style="width: 80px; height: 80px; object-fit: cover; margin-bottom: 5px; border: 1px solid #ccc;">
          </div>`
        )
        .style("display", "block")
        .style("opacity", "1 !important");
    })
    .on("mousemove", event => {
      const containerRect = containerRef.current.getBoundingClientRect(); 
      tooltip
        .style("left", `${event.clientX - containerRect.left + 10}px`)
        .style("top", `${event.clientY - containerRect.top - 40}px`);
    })
    .on("mouseout", (event, d) => {
      d3.select(event.currentTarget).attr("fill", colorScale(d.mean));
      tooltip.style("display", "none");
    });

    g.append("g").call(d3.axisLeft(yScale));

    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + margin.bottom - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Images");
    
    g.append("text")
      .attr("x", -margin.left - 10 / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .style("font-size", "14px")
      .text("Mean Response");

    return () => {
        d3.select(".tooltip").remove(); // Cleanup tooltip on component unmount
    };

  }, [barChartData, containerWidth, height, order, fileMappings]);

  return (
    <div
    ref={containerRef}
    style={{
      position: 'relative',
      width: 'auto',
      height,
      backgroundColor: 'transparent',
      display: 'flex',
      flexDirection: 'column', // Stack dropdown above the chart
      alignItems: 'center', // Center align content
      paddingTop: '40px' // Add extra space for the dropdown
    }}
  >
    {/* Order By Dropdown */}
    {/* <div
      className="mode-bar"
      style={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.8)', // Slight transparency for better visibility
        padding: '5px 10px',
        borderRadius: '5px',
      }}
    >
      <label style={{ marginRight: '5px', fontSize: '14px' }}>Order by:</label>
      <select
        value={order}
        onChange={(e) => setOrder(e.target.value)}
        style={{ fontSize: '14px', padding: '2px' }}
      >
        <option value="filename">Filename</option>
        <option value="ranking">Ranking</option>
      </select>
    </div> */}

    {/* Bar Chart */}
    <svg ref={svgRef} style={{ marginTop: '20px' }}></svg> {/* Added marginTop */}
  </div>




  );
};

export default BarChart;
