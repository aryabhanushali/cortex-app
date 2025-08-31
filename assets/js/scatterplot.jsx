import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ScatterMurtyVsNsd = ({ murtyData, nsdData, roi}) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!murtyData || !nsdData) return;

    // 清空旧图
    d3.select(containerRef.current).select("svg").remove();

    const width = window.innerWidth * 0.7;
    const height = 600;
    const margin = { top: 50, right: 50, bottom: 50, left: 70 };

    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // 整理点：model 在不同 dataset 上的分数
    const points = [];
    Object.keys(murtyData[roi] || {}).forEach((model) => {
      const murtyVals = murtyData[roi][model]; // { dataset: [score, pval] }
      const nsdVals = nsdData[roi][model];
      if (!murtyVals || !nsdVals) return;

      Object.keys(murtyVals).forEach((dataset) => {
        const x = murtyVals[dataset]?.[0];
        const y = nsdVals[dataset]?.[0];
        if (x != null && y != null) {
          points.push({
            model,
            dataset,
            x,
            y,
          });
        }
      });
    });

    // scale
    const xScale = d3
      .scaleLinear()
      .domain([d3.min(points, (d) => d.x) - 0.05, d3.max(points, (d) => d.x) + 0.05])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(points, (d) => d.y) - 0.05, d3.max(points, (d) => d.y) + 0.05])
      .range([height - margin.bottom, margin.top]);

    // 轴
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // 参考线 y=x
    svg.append("line")
      .attr("x1", margin.left)
      .attr("y1", yScale(d3.min(points, d => d.x)))
      .attr("x2", xScale(d3.max(points, d => d.x)))
      .attr("y2", yScale(d3.max(points, d => d.x)))
      .attr("stroke", "black")
      .attr("stroke-dasharray", "4 2")
      .attr("opacity", 0.5);

    // 散点
    svg.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 5)
      .attr("fill", "#73AED2")
      .attr("opacity", 0.7);

    // tooltip (可选)
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("font-size", "12px");

    svg.selectAll("circle")
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(`<b>${d.model}</b><br/>${d.dataset}<br/>Murty=${d.x.toFixed(3)}, NSD=${d.y.toFixed(3)}`)
          .style("top", `${event.pageY - 30}px`)
          .style("left", `${event.pageX + 10}px`);
      })
      .on("mouseout", () => tooltip.style("visibility", "hidden"));

    // 标题
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")

  }, [murtyData, nsdData, roi]);

  return <div ref={containerRef}></div>;
};

export default ScatterMurtyVsNsd;
