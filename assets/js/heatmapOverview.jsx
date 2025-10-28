import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const HeatmapOverview = ({ data, roi, dataset, rank, onModelClick }) => {
  const chartRef = useRef();
  const [availableHeight, setAvailableHeight] = useState(window.innerHeight - 200);
  const [selectedModel, setSelectedModel] = useState(null);


  useEffect(() => {
    const updateHeight = () => {
      const offset = 200; 
      setAvailableHeight(window.innerHeight - offset);
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  // 绘图主逻辑
  useEffect(() => {
    if (!data) return;

    const container = d3.select(chartRef.current);
    container.select("svg").remove(); // 清空旧图

    let xLabels = [];
    let models = [];
    let cellData = [];

    // --- ROI 模式 ---
    if (roi && data[roi]) {
      models = Object.keys(data[roi]);
      xLabels = Array.from(new Set(models.flatMap((m) => Object.keys(data[roi][m] || {}))));
      models.forEach((model) => {
        xLabels.forEach((x) => {
          const vals = data[roi][model]?.[x];
          if (vals) cellData.push({ model, x, raw: vals[0], norm: vals[1] });
        });
      });
    }
    // --- Dataset 模式 ---
    else if (dataset) {
      const rois = Object.keys(data).filter((r) => r !== "overall");
      const seen = new Set();
      rois.forEach((r) => {
        const modelNames = Object.keys(data[r] || {});
        modelNames.forEach((model) => {
          const vals = data[r][model]?.[dataset];
          if (vals) cellData.push({ model, x: r, raw: vals[0], norm: vals[1] });
          seen.add(model);
        });
      });
      models = Array.from(seen);
      xLabels = rois;
    } else return;

    if (!cellData.length) return;

    // --- 排序逻辑 ---
    if (rank === "rank") {
      const avg = {};
      models.forEach((m) => {
        const vals = cellData.filter((d) => d.model === m).map((d) => d.raw);
        avg[m] = d3.mean(vals);
      });
      models.sort((a, b) => (avg[b] || 0) - (avg[a] || 0));
    }

    // --- 自动计算尺寸 ---
    // const totalWidth = chartRef.current.clientWidth;
    const totalHeight = availableHeight;
    const rowHeight = totalHeight / models.length;
    // const colWidth = totalWidth / xLabels.length;

    // const totalHeight = availableHeight;
    const colWidth = 30; 
    const totalWidth = colWidth * xLabels.length;
    // const rowHeight = totalHeight / models.length;

    const containerWidth = chartRef.current.clientWidth;
    const offsetX = Math.max(0, (containerWidth - totalWidth) / 2);


    const svgWidth = Math.max(containerWidth, totalWidth + offsetX * 2);


    const colorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(["#D3D3D3", "#9CC9FF"]);

    // --- 创建 SVG ---
    const svg = container
      .append("svg")
      // .attr("width", "100%")
      // .attr("height", availableHeight)
      // .attr("viewBox", `0 0 ${totalWidth} ${totalHeight}`)
      .attr("width", svgWidth)
      .attr("height", totalHeight)
      .style("background", "transparent");

      

    // --- 绘制方格 ---
    const rects = svg
      .selectAll("rect")
      .data(cellData)
      .enter()
      .append("rect")
      .attr("x", (d) => offsetX + xLabels.indexOf(d.x) * colWidth)
      .attr("y", (d) => models.indexOf(d.model) * rowHeight)
      .attr("width", colWidth)
      .attr("height", rowHeight)
      .attr("fill", (d) => colorScale(d.norm ?? 0))
      .attr("stroke", "white")
      .attr("stroke-width", 0.3)
      .style("cursor", "pointer")
      .on("mouseover", function (_, d) {
        d3.select(this).attr("fill", "#4f9eff");
      })
      .on("mouseout", function (_, d) {
        d3.select(this).attr("fill", colorScale(d.norm ?? 0));
      })
      .on("click", function (_, d) {
        const newModel = selectedModel === d.model ? null : d.model;
        setSelectedModel(newModel);
        if (onModelClick) onModelClick(newModel);

        rects.attr("stroke-width", (dd) =>
          newModel && dd.model === newModel ? 1.5 : 0.3
        );
      });
  }, [data, roi, dataset, rank, availableHeight, onModelClick, selectedModel]);

  return (
    <div
      ref={chartRef}
      style={{
        width: "100%",
        height: `${availableHeight}px`,
        overflow: "hidden",
        background: "transparent",
      }}
    />
  );
};

export default HeatmapOverview;
