import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const RoiBarChart = ({ data, roi, dataset }) => {
  const ceilingRef = useRef();
  const barsRef = useRef();

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
    const margin = { top: 10, right: 20, bottom: 100, left: 60 };
    const height = 400;

    // y scale
    const y = d3.scaleLinear().domain([0, 0.9]).range([height - margin.bottom, margin.top]);

    // ================= 左边 ceiling SVG =================
    const ceilingSvg = d3.select(ceilingRef.current);
    ceilingSvg.selectAll("*").remove();
    const ceilingWidth = margin.left + 70; // y轴 + ceiling bar

    ceilingSvg.attr("width", ceilingWidth).attr("height", height);

    // ceiling bar
    ceilingSvg
      .append("rect")
      .attr("x", margin.left + 15) // 画在 y 轴右边
      .attr("y", ceilingMax ? y(ceilingMax) : y(0))
      .attr("width", barWidth)
      .attr("height", ceilingMax ? y(0) - y(ceilingMax) : 0)
      .attr("fill", "#d3d3d3")
      .attr("stroke", "black");

    // y 轴
    ceilingSvg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5))
      .call((g) => {
        g.select(".domain").attr("stroke", "black");
        g.selectAll("line").remove();
        g.selectAll("text").attr("fill", "black");
      });

    // ceiling max/median text
    // if (ceilingMax !== null) {
    //   ceilingSvg
    //     .append("text")
    //     .attr("x", margin.left + barWidth + 3)
    //     .attr("y", y(ceilingMax) - 10)
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "10px")
    //     .style("fill", "#1f77b4")
    //     // .text(`Max: ${ceilingMax.toFixed(2)}`);
    // }
    // if (ceilingMedian !== null) {
    //   ceilingSvg
    //     .append("text")
    //     .attr("x", margin.left + barWidth + 3)
    //     .attr("y", y(ceilingMedian) - 10)
    //     .attr("text-anchor", "middle")
    //     .style("font-size", "10px")
    //     .style("fill", "#74C5F7")
    //     // .text(`Median: ${ceilingMedian.toFixed(2)}`);
    // }

    
    // y 轴 label
    ceilingSvg
      .append("text")
      .attr("x", margin.left - 45)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("transform", `rotate(-90, ${margin.left - 45}, ${height / 2})`)
      .style("font-size", "14px")
      .attr("fill", "black")
      .text("Pearson Correlation");

    // ================= 右边 bars SVG =================
    const barsSvg = d3.select(barsRef.current);
    barsSvg.selectAll("*").remove();

    const width = results.length * (barWidth + 10) + margin.right;
    barsSvg.attr("width", width).attr("height", height);

    const x = d3
      .scaleBand()
      .domain(results.map((d) => d.model))
      .range([10, width - margin.right])
      .padding(0.2);

    // bars
    barsSvg
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

    // X labels
    barsSvg
      .append("g")
      .selectAll("text.model-label")
      .data(results)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.model) + x.bandwidth() / 2)
      .attr("y", height - margin.bottom + 10)
      .attr("text-anchor", "start")
      .attr("font-size", "9px")
      .attr("fill", "black")
      .attr(
        "transform",
        (d) =>
          `rotate(60, ${x(d.model) + x.bandwidth() / 2}, ${height - margin.bottom + 10})`
      )
      .text((d) => d.model);

      function drawLine(svg, label, value, color, svgWidth) {
      if (value == null) return;
      svg
        .append("line")
        .attr("x1", 0)
        .attr("x2", svgWidth)
        .attr("y1", y(value))
        .attr("y2", y(value))
        .attr("stroke", color)
        .attr("stroke-dasharray", "4 2")
        .attr("stroke-width", 1);

      svg
        .append("text")
        .attr("x", svgWidth - 5)
        .attr("y", y(value) - 5)
        .attr("text-anchor", "end")
        .style("font-size", "10px")
        .style("fill", color)
        .text(`${label}: ${value.toFixed(2)}`);
    }

    // 在左右 svg 都画
    drawLine(ceilingSvg, "Max", ceilingMax, "#1f77b4", ceilingWidth);
    drawLine(ceilingSvg, "Median", ceilingMedian, "#74C5F7", ceilingWidth);

    drawLine(barsSvg, "Max", ceilingMax, "#1f77b4", width);
    drawLine(barsSvg, "Median", ceilingMedian, "#74C5F7", width);

  }, [data, roi, dataset]);


  

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {/* 左边 ceiling + y 轴 */}
      <div>
        <svg ref={ceilingRef}></svg>
      </div>

      {/* 右边模型 bars */}
      <div style={{ overflowX: "auto" }}>
        <svg ref={barsRef}></svg>
      </div>
    </div>
  );
};

export default RoiBarChart;
