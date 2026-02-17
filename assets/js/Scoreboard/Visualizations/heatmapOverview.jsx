
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const HeatmapOverview = ({ data, roi, dataset, rank, onModelClick, selectedModel, visibleRange }) => {
  const chartRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!chartRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    resizeObserver.observe(chartRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!data || dimensions.width === 0 || dimensions.height === 0) return;

    const container = d3.select(chartRef.current);
    container.select("svg").remove();

    // --- 1. 数据处理 (保持你原来的逻辑) ---
    // let xLabels = [];
    // let models = [];
    // let cellData = [];

    // if (roi && data[roi]) {
    //   models = Object.keys(data[roi]).filter((m) => m !== "ceiling");
    //   xLabels = Array.from(new Set(models.flatMap((m) => Object.keys(data[roi][m] || {}))));
    //   models.forEach((model) => {
    //     xLabels.forEach((x) => {
    //       const vals = data[roi][model]?.[x];
    //       if (vals) cellData.push({ model, x, raw: vals[0], norm: vals[1] });
    //     });
    //   });
    // } else if (dataset) {
    //   const rois = Object.keys(data).filter((r) => r !== "overall");
    //   const seen = new Set();
    //   rois.forEach((r) => {
    //     const modelNames = Object.keys(data[r] || {}).filter((m) => m !== "ceiling");
    //     modelNames.forEach((model) => {
    //       const vals = data[r][model]?.[dataset];
    //       if (vals) cellData.push({ model, x: r, raw: vals[0], norm: vals[1] });
    //       seen.add(model);
    //     });
    //   });
    //   models = Array.from(seen);
    //   xLabels = rois;
    // }

    // if (!cellData.length) return;

    // if (rank === "rank") {
    //   const avg = {};
    //   models.forEach((m) => {
    //     const vals = cellData.filter((d) => d.model === m).map((d) => d.raw);
    //     avg[m] = d3.mean(vals);
    //   });
    //   models.sort((a, b) => (avg[b] || 0) - (avg[a] || 0));
    // }

    // --- 1. 数据处理 ---
    let cellData = [];
    let modelsSet = new Set();
    let xLabelsSet = new Set();

    if (roi && data[roi] && !dataset) {
      // 模式 A: 固定 ROI，对比不同 Dataset
      const rawModels = Object.keys(data[roi]).filter((m) => m !== "ceiling");
      rawModels.forEach((model) => {
        Object.entries(data[roi][model] || {}).forEach(([x, vals]) => {
          if (vals) {
            cellData.push({ model, x, raw: vals[0], norm: vals[1] });
            modelsSet.add(model);
            xLabelsSet.add(x); // 只有有数据的 x 轴标签才会被加入
          }
        });
      });
    } else if (dataset) {
      // 模式 B: 固定 Dataset，对比不同 ROI
      const rois = Object.keys(data).filter((r) => r !== "overall" && r !== "Across Regions");
      rois.forEach((r) => {
        const modelNames = Object.keys(data[r] || {}).filter((m) => m !== "ceiling");
        modelNames.forEach((model) => {
          const vals = data[r][model]?.[dataset];
          if (vals) {
            cellData.push({ model, x: r, raw: vals[0], norm: vals[1] });
            modelsSet.add(model);
            xLabelsSet.add(r); // 只有这个 Dataset 下有数据的 ROI 才会被加入
          }
        });
      });
    }

    if (!cellData.length) return;

    // 关键：现在的 xLabels 和 models 只包含有数据的项
    let xLabels = Array.from(xLabelsSet);
    let models = Array.from(modelsSet);

    // 排序逻辑 (如果是 rank 模式)
    if (rank === "rank") {
      const avg = {};
      models.forEach((m) => {
        const vals = cellData.filter((d) => d.model === m).map((d) => d.raw);
        avg[m] = d3.mean(vals);
      });
      models.sort((a, b) => (avg[b] || 0) - (avg[a] || 0));
    }

    // --- 2. 绘图准备 ---
    const totalWidth = dimensions.width;
    const totalHeight = dimensions.height;
    const rowHeight = totalHeight / models.length;
    const colWidth = totalWidth / xLabels.length;
    const colorScale = d3.scaleLinear().domain([0, 1]).range(["#D3D3D3", "#9CC9FF"]);

    const svg = container
      .append("svg")
      .attr("width", totalWidth)
      .attr("height", totalHeight)
      .style("background", "white");

    // --- 3. 画热图格子 ---
    svg
      .selectAll("rect.cell")
      .data(cellData)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr("x", (d) => xLabels.indexOf(d.x) * colWidth)
      .attr("y", (d) => models.indexOf(d.model) * rowHeight)
      .attr("width", colWidth)
      .attr("height", rowHeight)
      .attr("fill", (d) => colorScale(d.norm ?? 0))
      .attr("stroke", (d) => d.model === selectedModel ? "black" : "white")
      .attr("stroke-width", (d) => d.model === selectedModel ? 1 : 0.3)
      .style("cursor", "pointer")
      .on("click", (_, d) => onModelClick && onModelClick(d.model === selectedModel ? null : d.model));

    // =========================================================
    // ✅ 关键新增：画出对应的可视范围框 (Visible Box)
    // =========================================================
    if (visibleRange && models.length > 0) {
      const { start, end } = visibleRange;
      
      // 根据行号计算在 Overview 里的像素位置
      const boxY = start * rowHeight;
      const boxHeight = (end - start) * rowHeight;

      if (boxHeight > 0) {
        svg.append("rect")
          .attr("class", "visible-range-rect")
          .attr("x", 0)
          .attr("y", boxY)
          .attr("width", totalWidth)
          .attr("height", boxHeight)
          .attr("fill", "rgba(255, 69, 0, 0.1)") // 浅浅的底色
          .attr("stroke", "#FF4500")           // 明显的橙红色边框
          .attr("stroke-width", 2)
          .style("pointer-events", "none");    // ✨ 必须设为 none，否则挡住下面的点击
      }
    }

    // ✅ 4. 依赖数组必须包含 visibleRange
  }, [data, roi, dataset, rank, dimensions, onModelClick, selectedModel, visibleRange]); 

  return (
    <div ref={chartRef} style={{ width: "100%", height: "100%", overflow: "hidden", background: "white" }} />
  );
};

export default HeatmapOverview;