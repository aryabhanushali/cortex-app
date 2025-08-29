import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const RoiBarChart = ({ data, roi, title, dataset }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || !roi || !data[roi]) return;

    const roiData = data[roi];

    // ==== 数据处理 ====
    const models = Object.keys(roiData).filter((m) => m !== "ceiling");
    const results = models
      .map((model) => {
        const val = roiData[model]?.[dataset]?.[0];
        return { model, val };
      })
      .filter((d) => d.val !== undefined);

    const ceilingVals = Object.values(roiData["ceiling"] || {}).map((d) => d[0]);
    const ceilingMax = ceilingVals.length ? d3.max(ceilingVals) : null;
    const ceilingMedian = ceilingVals.length ? d3.median(ceilingVals) : null;

    // ==== 尺寸 ====
    const barWidth = 30;
    const margin = { top: 30, right: 80, bottom: 100, left: 80 };
    const width = margin.left + margin.right + results.length * barWidth;
    const height = 400;

    // ==== Scale ====
    const x = d3
      .scaleBand()
      .domain(results.map((d) => d.model))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const y = d3.scaleLinear().domain([0, 1]).nice().range([height - margin.bottom, margin.top]);

    // ==== SVG 基础 ====
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // ==== Bars ====
    svg
      .append("g")
      .selectAll("rect")
      .data(results)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.model))
      .attr("y", (d) => y(d.val))
      .attr("width", x.bandwidth())
      .attr("height", (d) => y(0) - y(d.val))
      .attr("fill", "#d3d3d3")
      .attr("stroke", "black");

    // ==== Ceiling Lines ====
    if (ceilingMax !== null) {
      svg
        .append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", y(ceilingMax))
        .attr("y2", y(ceilingMax))
        .attr("stroke", "#1f77b4")
        .attr("stroke-dasharray", "4,4");

      svg
        .append("text")
        .attr("x", width - margin.right)
        .attr("y", y(ceilingMax) - 5)
        .attr("text-anchor", "end")
        .style("font-size", "10px")
        .style("fill", "#1f77b4")
        .text(`Ceiling Max: ${ceilingMax.toFixed(2)}`);
    }

    if (ceilingMedian !== null) {
      svg
        .append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", y(ceilingMedian))
        .attr("y2", y(ceilingMedian))
        .attr("stroke", "#74C5F7")
        .attr("stroke-dasharray", "4,4");

      svg
        .append("text")
        .attr("x", width - margin.right)
        .attr("y", y(ceilingMedian) - 5)
        .attr("text-anchor", "end")
        .style("font-size", "10px")
        .style("fill", "#74C5F7")
        .text(`Ceiling Median: ${ceilingMedian.toFixed(2)}`);
    }

    // ==== X Axis (labels) ====
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickFormat(() => "")) // 去掉默认 ticks
      .selectAll("text")
      .remove();

    svg
      .append("g")
      .selectAll("text.model-label")
      .data(results)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.model) + x.bandwidth() / 2)
      .attr("y", height - margin.bottom + 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "9px")
      .attr(
        "transform",
        (d) =>
          `rotate(60, ${x(d.model) + x.bandwidth() / 2}, ${height - margin.bottom + 40})`
      )
      .text((d) => d.model);

    // ==== Y Axis ====
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .call((g) => g.select(".domain").remove());

    // ==== Y Axis Label ====
    svg
      .append("text")
      .attr("x", margin.left - 50)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90, ${margin.left - 50}, ${height / 2})`)
      .style("font-size", "12px")
      .text("Pearson Correlation");
  }, [data, roi, title, dataset]);

  return (
    <div>
      {/* 标题单独放在 SVG 外，始终居中，不随滚动 */}
      <div
        style={{
          textAlign: "center",
          fontSize: "16px",
          fontWeight: "bold",
          marginTop: "-40px"

        }}
      >
        {title} — ROI: {roi.toUpperCase()} — Dataset: {dataset}
      </div>

      {/* 横向滚动容器 */}
      <div style={{ overflowX: "auto", border: "1px solid #ccc" ,  marginTop: "-85px"}}>
        <svg ref={svgRef}></svg>
      </div>
    </div>
  );
};

export default RoiBarChart;
