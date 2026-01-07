// // ScatterGapCeiling.jsx
// import React, { useEffect, useRef } from "react";
// import * as d3 from "d3";

// const roiColors = { ppa: "#1f77b4", ffa: "#ff7f0e", eba: "#2ca02c" };
// const roiSize = { ppa: 120, ffa: 120, eba: 120 };

// const datasetShapes = {
//   bold_5000: d3.symbolCircle,
//   bonner_2021: d3.symbolCircle,
//   kingbaker_2019: d3.symbolCircle,
//   wardle_2020: d3.symbolCircle,
//   bmd_2024: d3.symbolTriangle,
//   nsd_syn: d3.symbolDiamond,
//   nsd_1000: d3.symbolCircle,
//   murty185: d3.symbolCircle,
// };

//  const datasetLabelMap = {
//   murty185: "Murty185",
//   nsd_1000: "NSD1000",
//   bold_5000: "BOLD5000v2",
//   bonner_2021: "Bonner2021",
//   bmd_2024: "BMD2024",
//   kingbaker_2019: "King2019",
//   wardle_2020: "Wardle2020",
//   nsd_syn: "NSD synthetic",
  
// };

// const datasetTypeLabels = {
//   circle: "Natural Dataset",
//   triangle: "Video Dataset (BMD)",
//   diamond: "Synthetic / OOD",
// };

// export default function ScatterGapCeiling({
//   murtyData,
//   nsdData,
//   ceilingData,
//   roi,
//   dataset,
//   training,   
// }) {
//   const svgRef = useRef();

//   useEffect(() => {
//     if (!murtyData && !nsdData) return;

//     // =====  training filter =====
//     let entries = [];
//     if (training === "Murty185") {
//       entries = [
//         ...Object.entries(murtyData || {}).map(([key, value]) => {
//           const [ds, roiName] = key.split("/");
//           return { Dataset: ds, ROI: roiName, Train: "Murty185", ...value };
//         }),
//       ];
//     } else if (training === "NSD") {
//       entries = [
//         ...Object.entries(nsdData || {}).map(([key, value]) => {
//           const [ds, roiName] = key.split("/");
//           return { Dataset: ds, ROI: roiName, Train: "NSD1000", ...value };
//         }),
//       ];
//     } else {
//       entries = [
//         ...Object.entries(murtyData || {}).map(([key, value]) => {
//           const [ds, roiName] = key.split("/");
//           return { Dataset: ds, ROI: roiName, Train: "Murty185", ...value };
//         }),
//         ...Object.entries(nsdData || {}).map(([key, value]) => {
//           const [ds, roiName] = key.split("/");
//           return { Dataset: ds, ROI: roiName, Train: "NSD1000", ...value };
//         }),
//       ];
//     }


//     let filtered;
//     // if (dataset === "murty185" || dataset === "nsd_1000") {
//     //   filtered = entries.filter(
//     //     (d) =>
//     //       d.Train.toLowerCase() === dataset.toLowerCase() &&
//     //       (roi === "" || d.ROI === roi)
//     //   );
//     // } else {
//       filtered = entries.filter(
//         (d) =>
//           (roi === "" || d.ROI === roi) &&
//           (dataset === "" || d.Dataset === dataset)
//       );
//     // }

//     const grouped = d3.rollups(
//       filtered,
//       (v) => ({
//         ceiling_mean: d3.mean(v, (d) => d.ceiling_mean),
//         normalized_gap: d3.mean(v, (d) => d.normalized_gap),
//         sem: d3.mean(v, (d) => d.sem_normalized_model || 0),
//         variance: d3.mean(v, (d) => d.std_normalized_model || 0),
//         rawPoints: v,
//       }),
//       (d) => `${d.Dataset}/${d.ROI}`
//     );

//     const aggregated = grouped.map(([key, stats]) => {
//       const [dataset, roi] = key.split("/");
//       return { Dataset: dataset, ROI: roi, id: key, ...stats };
//     });

//     const margin = { top: 40, right: 20, bottom: 60, left: 80 };
//     const width = 1080;
//     const height = 800;

//     const svg = d3
//       .select(svgRef.current)
//       .attr("width", width)
//       .attr("height", height);
//     svg.selectAll("*").remove();

//     const plotWidth = width - margin.left - margin.right;
//     const plotHeight = height - margin.top - margin.bottom;

//     const g = svg
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     const x = d3.scaleLinear().domain([-0.4, 1.0]).range([0, plotWidth]);
//     const y = d3.scaleLinear().domain([0, 1.0]).range([plotHeight, 0]);

//     g.append("g")
//       .attr("transform", `translate(0,${plotHeight})`)
//       .call(d3.axisBottom(x).tickValues(d3.range(-0.4, 1.05, 0.1)))
//       .attr("class", "axis");
//     g.append("g").call(d3.axisLeft(y)).attr("class", "axis");

//     svg
//       .append("text")
//       .attr("x", width / 2)
//       .attr("y", height - 10)
//       .attr("text-anchor", "middle")
//       .style("font-size", "16px")
//       .text("Dataset Ceiling: Mean Subject Pairwise Correlations ± Variability");
//     svg
//       .append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("x", -height / 2)
//       .attr("y", 15)
//       .attr("text-anchor", "middle")
//       .style("font-size", "16px")
//       .text("Normalized Gap Between Model Performance and Dataset Ceiling");

//     const hoverLayer = g.append("g").attr("class", "hover-layer");

//     aggregated.forEach((row) => {
//       const { Dataset, ROI, id } = row;
//       if (
//         row.ceiling_mean == null ||
//         row.normalized_gap == null ||
//         isNaN(row.ceiling_mean) ||
//         isNaN(row.normalized_gap)
//       )
//         return;

//       const cx = x(row.ceiling_mean);
//       const cy = y(row.normalized_gap);

//       const color = roiColors[ROI] || "gray";
//       const size = roiSize[ROI] || 100;

//       const shapeFn = datasetShapes[Dataset] || d3.symbolCircle;
//       const shape = d3.symbol().type(shapeFn).size(size)();

//       // ceiling range
//       if (ceilingData?.[ROI]?.[Dataset]?.correlation_points) {
//         const rawVals = ceilingData[ROI][Dataset].correlation_points;
//         if (rawVals.length > 0) {
//           const rawMin = d3.min(rawVals);
//           const rawMax = d3.max(rawVals);
//           g.append("line")
//             .attr("class", "agg-item")
//             .attr("data-id", id)
//             .attr("x1", x(rawMin))
//             .attr("x2", x(rawMax))
//             .attr("y1", cy)
//             .attr("y2", cy)
//             .attr("stroke", color)
//             .attr("stroke-width", 6)
//             .attr("opacity", 0.3);
//         }
//       }

//       const mainDot = g
//         .append("path")
//         .attr("class", "agg-item")
//         .attr("data-id", id)
//         .attr("d", shape)
//         .attr("transform", `translate(${cx},${cy})`)
//         .attr("fill", color)
//         .attr("stroke", "black")
//         .attr("stroke-width", 1);

//       if (Math.abs(row.normalized_gap) > 0.2 || (row.variance ?? 0) > 0.05) {
//         g.append("text")
//           .attr("class", "agg-item")
//           .attr("data-id", id)
//           .attr("x", cx + 5)
//           .attr("y", cy)
//           .attr("font-size", 9)
//           .attr("fill", "black")
//           .text(`${datasetLabelMap[Dataset]}/${ROI.toUpperCase()}:${row.normalized_gap.toFixed(2)}`);
//       }
//       mainDot
//       .on("mouseover", () => {
//         g.selectAll(".agg-item").attr("display", "none");

//         g.selectAll(`.agg-item[data-id='${id}']`).attr("display", null);


//         mainDot.transition().duration(200).attr("opacity", 0.3);

//         hoverLayer.selectAll("*").remove();

//         if (row.rawPoints?.length > 0) {
//           const sortedPoints = [...row.rawPoints].sort(
//             (a, b) => a.normalized_gap - b.normalized_gap
//           );

//           sortedPoints.forEach((pt, i) => {
//             const px = x(pt.ceiling_mean);
//             const py = y(pt.normalized_gap);
//             const subShape = d3.symbol().type(shapeFn).size(80)();

//             // animation
//             hoverLayer
//               .append("path")
//               .attr("d", subShape)
//               .attr("transform", `translate(${px},${py})`)
//               .attr("fill", color)
//               .attr("stroke", "black")
//               .attr("opacity", 0)
//               .transition()
//               .duration(300)
//               .attr("opacity", 1);

//             const labelY = i === 0 ? py + 15 : py - 11;
//             hoverLayer
//               .append("text")
//               .attr("x", px)
//               .attr("y", labelY)
//               .attr("text-anchor", "middle")
//               .attr("font-size", 10)
//               .attr("fill", "black")
//               .attr("opacity", 0)
//               .text(`Trained on ${pt.Train}: ${pt.normalized_gap.toFixed(2)}`)
//               .transition()
//               .duration(300)
//               .attr("opacity", 1);
//           });
//         }
//       })
//       .on("mouseout", () => {
        
//         mainDot.transition().duration(200).attr("opacity", 1);
//         g.selectAll(".agg-item").attr("display", null);
//         hoverLayer.selectAll("*").remove();
//       });

  
//     });

//     const roiLegend = svg
//       .append("g")
//       .attr("transform", `translate(${width - plotWidth + 20},${margin.top + 150})`);
//     Object.entries(roiColors)
//       .filter(([roiKey]) => roi === "" || roiKey === roi)
//       .forEach(([roiKey, color], i) => {
//         roiLegend
//           .append("text")
//           .attr("x", 15)
//           .attr("y", i * 28 + 4)
//           .attr("font-size", 24)
//           .attr("fill", color)
//           .text(roiKey.toUpperCase());
//       });

//     const shapeLegend = svg
//       .append("g")
//       .attr("transform", `translate(${width - plotWidth + 20},${margin.top + 40})`);
//     Object.entries(datasetTypeLabels).forEach(([shapeName, label], i) => {
//       const shapeFn =
//         shapeName === "circle"
//           ? d3.symbolCircle
//           : shapeName === "triangle"
//           ? d3.symbolTriangle
//           : d3.symbolDiamond;
//       const path = d3.symbol().type(shapeFn).size(120)();
//       shapeLegend
//         .append("path")
//         .attr("d", path)
//         .attr("transform", `translate(0,${i * 24 - 2})`)
//         .attr("fill", "white")
//         .attr("stroke", "black");
//       shapeLegend
//         .append("text")
//         .attr("x", 15)
//         .attr("y", i * 24 + 4)
//         .attr("font-size", 20)
//         .text(label);
//     });
//   }, [murtyData, nsdData, ceilingData, roi, dataset,training]);

//   return (
//     <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
//       <svg ref={svgRef}></svg>
//     </div>
//   );
// }
import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

// 配置常量 (保持不变)
const roiColors = { ppa: "#1f77b4", ffa: "#ff7f0e", eba: "#2ca02c", overall: "#666" };
const datasetShapes = {
  bold_5000: d3.symbolCircle, bonner_2021: d3.symbolCircle, kingbaker_2019: d3.symbolCircle,
  wardle_2020: d3.symbolCircle, bmd_2024: d3.symbolTriangle, nsd_syn: d3.symbolDiamond,
  nsd_1000: d3.symbolCircle, murty185: d3.symbolCircle,
};
const datasetLabelMap = {
  murty185: "Murty185", nsd_1000: "NSD1000", bold_5000: "BOLD5000v2",
  bonner_2021: "Bonner2021", bmd_2024: "BMD2024", kingbaker_2019: "King2019",
  wardle_2020: "Wardle2020", nsd_syn: "NSD synthetic",
};
const datasetTypeLabels = {
  circle: "Natural Dataset", triangle: "Video Dataset (BMD)", diamond: "Synthetic / OOD",
};

const ScatterGapCeiling = ({ murtyData, nsdData, ceilingData, roi, dataset, training }) => {
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hoveredData, setHoveredData] = useState(null);
  const [selectedPoint, setSelectedPoint] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // 1. 数据处理：确保 cRange 始终有值，防止报错
  const aggregatedPoints = useMemo(() => {
    if (!murtyData && !nsdData) return [];
    
    const process = (rawData, source) => {
      if (!rawData || typeof rawData !== 'object') return [];
      return Object.entries(rawData).map(([key, stats]) => {
        if (!key || !key.includes("/")) return null;
        const [ds, rName] = key.split("/");
        
        // ✨ 修复：根据你的扁平 Key 结构查找 Ceiling 原始点
        // 尝试两种路径以确保兼容性
        const ceilingObj = ceilingData?.[key] || ceilingData?.[rName]?.[ds];
        const rawCeilingVals = ceilingObj?.correlation_points || [];
        
        // 兜底逻辑：如果没有原始点，就用均值作为范围的两端
        const cMin = rawCeilingVals.length > 0 ? d3.min(rawCeilingVals) : (stats?.ceiling_mean || 0);
        const cMax = rawCeilingVals.length > 0 ? d3.max(rawCeilingVals) : (stats?.ceiling_mean || 0);

        return {
          id: key, dataset: ds, roi: rName.toLowerCase(), train: source,
          gap: stats?.normalized_gap ?? 0, 
          ceiling: stats?.ceiling_mean ?? 0, 
          cRange: [cMin, cMax], // 确保这是一个数组 [min, max]
          raw: stats
        };
      }).filter(item => item !== null);
    };

    const all = [...process(murtyData, "Murty185"), ...process(nsdData, "NSD1000")];
    const targetROI = (roi === "Across Regions" || !roi) ? "" : String(roi).toLowerCase();
    const targetDS = (dataset || "").toLowerCase();

    const filtered = all.filter(d => {
      const roiMatch = targetROI === "" || d.roi === targetROI;
      const dsMatch = targetDS === "" || d.dataset.toLowerCase() === targetDS;
      return roiMatch && dsMatch;
    });

    return d3.rollups(filtered, v => ({
      ceiling_mean: d3.mean(v, d => d.ceiling) || 0,
      gap_mean: d3.mean(v, d => d.gap) || 0,
      cRange: [d3.min(v, d => d.cRange[0]), d3.max(v, d => d.cRange[1])],
      points: v 
    }), d => `${d.dataset}/${d.roi}`).map(([key, val]) => ({ id: key, ...val }));
  }, [murtyData, nsdData, ceilingData, roi, dataset]);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0 || aggregatedPoints.length === 0) return;

    const container = d3.select(containerRef.current);
    let svg = container.select("svg");
    if (svg.empty()) svg = container.append("svg");
    svg.attr("width", dimensions.width).attr("height", dimensions.height);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 60, right: 60, bottom: 60, left: 70 };
    const mainSize = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom);
    const centerXOffset = (width - margin.left - margin.right - mainSize) / 2;

    const x = d3.scaleLinear().domain([-0.4, 1.0]).range([0, mainSize]);
    const y = d3.scaleLinear().domain([0, 1.0]).range([mainSize, 0]);

    // --- 图例 (动态堆叠) ---
    const rowHeight = 18;
    const visibleROIs = Object.entries(roiColors).filter(([k]) => k !== 'overall' && (roi === "Across Regions" || !roi || k === roi.toLowerCase()));
    const legendG = svg.append("g").attr("transform", `translate(20, 20)`);
    visibleROIs.forEach(([k, c], i) => {
      const row = legendG.append("g").attr("transform", `translate(0, ${i * rowHeight})`);
      row.append("circle").attr("r", 5).attr("fill", c);
      row.append("text").attr("x", 12).attr("y", 4).style("font-size", "10px").style("font-weight", "600").text(k.toUpperCase());
    });
    const shapeLegend = legendG.append("g").attr("transform", `translate(0, ${visibleROIs.length * rowHeight + 15})`);
    Object.entries(datasetTypeLabels).forEach(([t, l], i) => {
      const row = shapeLegend.append("g").attr("transform", `translate(0, ${i * rowHeight})`);
      const shapeFn = t === "circle" ? d3.symbolCircle : t === "triangle" ? d3.symbolTriangle : d3.symbolDiamond;
      row.append("path").attr("d", d3.symbol().type(shapeFn).size(40)()).attr("fill", "#666").attr("transform", "translate(0, -1)");
      row.append("text").attr("x", 12).attr("y", 4).style("font-size", "10px").text(l);
    });

    // --- 绘图区 ---
    const g = svg.append("g").attr("transform", `translate(${margin.left + centerXOffset},${margin.top})`);
    g.append("g").attr("transform", `translate(0,${mainSize})`).call(d3.axisBottom(x).ticks(6));
    g.append("g").call(d3.axisLeft(y).ticks(6));
    g.append("g").attr("stroke", "#eee").attr("stroke-dasharray", "2,2").call(d3.axisLeft(y).tickSize(-mainSize).tickFormat(""));

    const activeInfo = hoveredData || selectedPoint;
    const hoverLayer = g.append("g").attr("class", "hover-layer");

    // 绘制背景点 (Hover/Select 时变淡)
    g.selectAll(".agg-dot")
      .data(aggregatedPoints)
      .enter()
      .append("path")
      .attr("transform", d => `translate(${x(d.ceiling_mean)},${y(d.gap_mean)})`)
      .attr("d", d => d3.symbol().type(datasetShapes[d.id.split("/")[0]] || d3.symbolCircle).size(120)())
      .attr("fill", d => roiColors[d.id.split("/")[1]] || "#999")
      .attr("stroke", d => d.id === selectedPoint?.id ? "#000" : "#fff")
      .attr("stroke-width", d => d.id === selectedPoint?.id ? 2 : 1)
      .attr("opacity", d => activeInfo ? (d.id === activeInfo.id ? 0.8 : 0.3) : 1)
      .style("cursor", "pointer")
      .on("mouseover", (e, d) => setHoveredData(d))
      .on("mouseout", () => setHoveredData(null))
      .on("click", (e, d) => setSelectedPoint(d.id === selectedPoint?.id ? null : d));

    // --- ✨ 绘制激活层 (横线 + 裂变) ---
    if (activeInfo) {
      const color = roiColors[activeInfo.id.split("/")[1]] || "#999";
      const cy = y(activeInfo.gap_mean);

      // 1. ✨ Ceiling Variability 横线 (带安全检查)
      if (activeInfo.cRange && activeInfo.cRange.length >= 2) {
        hoverLayer.append("line")
          .attr("x1", x(activeInfo.cRange[0]))
          .attr("x2", x(activeInfo.cRange[1]))
          .attr("y1", cy)
          .attr("y2", cy)
          .attr("stroke", color)
          .attr("stroke-width", 6)
          .attr("opacity", 0.7)
          .attr("stroke-linecap", "round");
      }

      // 2. 裂变子点
      activeInfo.points.forEach((pt, i) => {
        const px = x(pt.ceiling);
        const py = y(pt.gap);
        const shapeFn = datasetShapes[pt.dataset] || d3.symbolCircle;

        hoverLayer.append("path")
          .attr("d", d3.symbol().type(shapeFn).size(100)())
          .attr("transform", `translate(${px},${py})`)
          .attr("fill", color)
          .attr("stroke", "black")
          .attr("stroke-width", 1.5)
          .attr("opacity", 0)
          .transition()
        
          .attr("opacity", 0.9);

        hoverLayer.append("text")
          .attr("x", px).attr("y", i === 0 ? py - 14 : py + 22)
          .attr("text-anchor", "middle")
          .style("font-size", "10px").style("font-weight", "bold")
          .text(`Trained on ${pt.train}`);
      });
    }
  }, [dimensions, aggregatedPoints, roi, hoveredData, selectedPoint]);

  // Sidebar 数据源判断
  const displayInfo = hoveredData || selectedPoint;

  return (
    <div style={{ display: "flex", width: "100%", height: "100%", background: "#fafafa", borderRadius: 12, overflow: "hidden" }}>
      <div ref={containerRef} style={{ flex: 1, position: "relative", minWidth: 0 }}></div>
      <div style={{ width: "260px", borderLeft: "1px solid #eee", padding: "20px", backgroundColor: "#fff", display: "flex", flexDirection: "column", gap: "15px" }}>
        <h5 style={{ margin: 0, fontSize: "14px", color: "#333", borderBottom: "2px solid #1890ff", paddingBottom: "8px" }}>ROI/Dataset Insight</h5>
        {displayInfo ? (
          <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
             {/* 此处保持之前的 Sidebar UI 内容不变 ... */}
             <div style={{ background: "#f0f7ff", padding: "10px", borderRadius: "6px" }}>
              <div style={{ fontWeight: "bold", color: "#0050b3" }}>{datasetLabelMap[displayInfo.id.split("/")[0]] || displayInfo.id.split("/")[0]}</div>
              <div style={{ color: "#555", textTransform: "uppercase", fontSize: "10px" }}>Region: {displayInfo.id.split("/")[1]}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              <div style={{ background: "#fafafa", padding: "8px", borderRadius: "4px", textAlign: "center" }}>
                <div style={{ color: "#888", fontSize: "10px" }}>Ceiling</div>
                <div style={{ fontWeight: "bold" }}>{displayInfo.ceiling_mean.toFixed(3)}</div>
              </div>
              <div style={{ background: "#fafafa", padding: "8px", borderRadius: "4px", textAlign: "center" }}>
                <div style={{ color: "#888", fontSize: "10px" }}>Avg Gap</div>
                <div style={{ fontWeight: "bold" }}>{displayInfo.gap_mean.toFixed(3)}</div>
              </div>
            </div>
            <div style={{ marginTop: "10px" }}>
              <div style={{ fontSize: "11px", fontWeight: "bold", marginBottom: "8px", color: "#888" }}>TRAINING SOURCES:</div>
              {displayInfo.points.map((pt, i) => (
                <div key={i} style={{ padding: "4px 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}>
                  <span>{pt.train}:</span><span style={{ fontWeight: 600 }}>{pt.gap.toFixed(3)}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ color: "#999", fontSize: "12px", textAlign: "center", marginTop: "40px", fontStyle: "italic" }}>Hover or click a point</div>
        )}
      </div>
    </div>
  );
};

export default ScatterGapCeiling;