// ScatterGapCeiling.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// === ROI style ===
const roiColors = { ppa: "#1f77b4", ffa: "#ff7f0e", eba: "#2ca02c" };
const roiSize = { ppa: 120, ffa: 120, eba: 120 };

// === Dataset shape map ===
const datasetShapes = {
  bold_5000: d3.symbolCircle,
  bonner_2021: d3.symbolCircle,
  kingbaker_2019: d3.symbolCircle,
  wardle_2020: d3.symbolCircle,
  bmd_2024: d3.symbolTriangle,
  nsd_syn: d3.symbolDiamond,
  nsd_1000: d3.symbolCircle,
  murty185: d3.symbolCircle,
};

// === Dataset shape legend labels ===
const datasetTypeLabels = {
  circle: "Natural Dataset",
  triangle: "Video Dataset (BMD)",
  diamond: "Synthetic / OOD",
};

export default function ScatterGapCeiling({ murtyData, nsdData, ceilingData, roi }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!murtyData && !nsdData) return;

    // === flatten dict into array with Train info ===
    const entries = [
      ...Object.entries(murtyData || {})
        .map(([key, value]) => {
          const [dataset, roiName] = key.split("/");
          return { Dataset: dataset, ROI: roiName, Train: "Murty185", ...value };
        })
        .filter(d => roi === "" || d.ROI === roi),   // ✅ 加过滤
    
      ...Object.entries(nsdData || {})
        .map(([key, value]) => {
          const [dataset, roiName] = key.split("/");
          return { Dataset: dataset, ROI: roiName, Train: "NSD1000", ...value };
        })
        .filter(d => roi === "" || d.ROI === roi),   // ✅ 加过滤
    ];

    // === 对于同一个 dataset+ROI，把 Murty 和 NSD 的结果取平均 ===
    const grouped = d3.rollups(
      entries,
      v => ({
        ceiling_mean: d3.mean(v, d => d.ceiling_mean),
        normalized_gap: d3.mean(v, d => d.normalized_gap),
        sem: d3.mean(v, d => d.sem_normalized_model || 0),
        variance: d3.mean(v, d => d.std_normalized_model || 0),
      }),
      d => `${d.Dataset}/${d.ROI}`
    );

    const aggregated = grouped.map(([key, stats]) => {
      const [dataset, roi] = key.split("/");
      return { Dataset: dataset, ROI: roi, ...stats };
    });

    // === Start drawing ===
    const margin = { top: 40, right: 20, bottom: 60, left: 80 };
    const width = 1080;
    const height = 800;

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);
    svg.selectAll("*").remove();

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // === Scales ===
    const x = d3.scaleLinear().domain([-0.4, 1.0]).range([0, plotWidth]);
    const y = d3.scaleLinear().domain([0, 1.0]).range([plotHeight, 0]);

    // Axes
    g.append("g").attr("transform", `translate(0,${plotHeight})`).call(d3.axisBottom(x).tickValues(d3.range(-0.4, 1.05, 0.1)));
    g.append("g").call(d3.axisLeft(y));

    // Labels
    svg.append("text").attr("x", width / 2).attr("y", height - 10).attr("text-anchor", "middle").style("font-size", "16px").text("Ceiling Mean");
    svg.append("text").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", 15).attr("text-anchor", "middle").style("font-size", "16px").text("Normalized Gap");
    

    // Zero line
    // g.append("line").attr("x1", 0).attr("x2", plotWidth).attr("y1", y(0)).attr("y2", y(0)).attr("stroke", "black").attr("stroke-dasharray", "4 2");

    // === Draw aggregated points ===
    aggregated.forEach(row => {
      if (
            row.ceiling_mean == null || 
            row.normalized_gap == null || 
            isNaN(row.ceiling_mean) || 
            isNaN(row.normalized_gap)
        ) {
            return; // 跳过无效点
        }
      const cx = x(row.ceiling_mean);
      const cy = y(row.normalized_gap);
      const roi = row.ROI;
      const dataset = row.Dataset;

      const color = roiColors[roi] || "gray";
      const size = roiSize[roi] || 100;

      const shapeFn = datasetShapes[dataset] || d3.symbolCircle;
      const shape = d3.symbol().type(shapeFn).size(size)();

      // === Horizontal range bar from ceilingData ===
      if (ceilingData?.[roi]?.[dataset]?.correlation_points) {
        const rawVals = ceilingData[roi][dataset].correlation_points;
        if (rawVals.length > 0) {
          const rawMin = d3.min(rawVals);
          const rawMax = d3.max(rawVals);
          g.append("line")
            .attr("x1", x(rawMin))
            .attr("x2", x(rawMax))
            .attr("y1", cy)
            .attr("y2", cy)
            .attr("stroke", color)
            .attr("stroke-width", 6)
            .attr("opacity", 0.3);
        }
      }

    //   // SEM bar
    //   if (row.sem != null) {
    //     g.append("line")
    //       .attr("x1", cx)
    //       .attr("x2", cx)
    //       .attr("y1", y(row.normalized_gap - row.sem))
    //       .attr("y2", y(row.normalized_gap + row.sem))
    //       .attr("stroke", color)
    //       .attr("stroke-width", 1.5);
    //   }

      // Main dot
      g.append("path")
        .attr("d", shape)
        .attr("transform", `translate(${cx},${cy})`)
        .attr("fill", color)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

      // Label (only highlight big gap/variance)
      if (Math.abs(row.normalized_gap) > 0.2 || (row.variance ?? 0) > 0.05) {
        g.append("text").attr("x", cx + 5).attr("y", cy).attr("font-size", 9).attr("fill", "black").text(`${dataset}/${roi}`);
      }
    });

    // === Legend: ROI Colors ===
    const roiLegend = svg.append("g").attr("transform", `translate(${width - plotWidth + 20},${margin.top + 150})`);
    Object.entries(roiColors)
    .filter(([roiKey]) => roi === "" || roiKey === roi) // ✅ 加过滤
    .forEach(([roiKey, color], i) => {
      roiLegend.append("text")
        .attr("x", 15)
        .attr("y", i * 28 + 4)
        .attr("font-size", 24)
        .attr("fill", color)
        .text(roiKey.toUpperCase());
    });

    // === Legend: Dataset Shapes ===
    const shapeLegend = svg.append("g").attr("transform", `translate(${width - plotWidth + 20},${margin.top + 40})`);
    Object.entries(datasetTypeLabels).forEach(([shapeName, label], i) => {
      const shapeFn =
        shapeName === "circle" ? d3.symbolCircle : shapeName === "triangle" ? d3.symbolTriangle : d3.symbolDiamond;
      const path = d3.symbol().type(shapeFn).size(120)();
      shapeLegend.append("path").attr("d", path).attr("transform", `translate(0,${i * 24 -2})`).attr("fill", "white").attr("stroke", "black");
      shapeLegend.append("text").attr("x", 15).attr("y", i * 24 + 4).attr("font-size", 20).text(label);
    });
  }, [murtyData, nsdData, ceilingData, roi]);

return (
  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
    <svg ref={svgRef} ></svg>
  </div>
);
}
