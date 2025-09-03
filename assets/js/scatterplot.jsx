import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
   
const ScatterMurtyVsNsd = ({ murtyData, nsdData, roi, dataset}) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!murtyData || !nsdData) return;

    // clear the old data
    d3.select(containerRef.current).select("svg").remove();

    const width = 910;
    const height = 930;
    const margin = { top: 180, right: 160, bottom: 50, left: 50 };
    const mainSize = 700; // 主散点区域大小
    const histHeight = 150; // 直方图高度
    const histWidth = 150;  // 直方图宽度

    const color_map = {

      "bold_5000": "#1f78b4",   // deep blue
      "bonner_2021": "#4dd0e1", // bright teal-blue
      "bmd_2024": "#60bd68",        // muted green
      "kingbaker_2019": "#9e75d6",  // soft purple
      "wardle_2020": "#e377c2",     // pink
      "nsd_syn": "#ffdd57"          // matte yellow
    };

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
       

      Object.keys(murtyVals).forEach((ds) => {
        if (dataset && ds !== dataset) return;
        if (ds === "ceiling") return; 
  
        const x = murtyVals[ds]?.[0];
        const y = nsdVals[ds]?.[0];

        if (["murty185", "nsd_1000"].includes(ds)) {
          return;
        }

        if (x != null && y != null) {
          points.push({
            model,
            dataset: ds,
            x,
            y,
          });
        }
      });
    });

    // scale
    const minVal = Math.min(d3.min(points, d => d.x), d3.min(points, d => d.y)) - 0.05;
    const maxVal = Math.max(d3.max(points, d => d.x), d3.max(points, d => d.y)) + 0.05;

    const xScale = d3.scaleLinear()
      .domain([minVal, maxVal])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([minVal, maxVal])  // 
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
      .attr("x1", xScale(minVal))
      .attr("y1", yScale(minVal))
      .attr("x2", xScale(maxVal))
      .attr("y2", yScale(maxVal))
      .attr("stroke", "black")
      .attr("stroke-dasharray", "4 2")
      .attr("opacity", 0.5);

     // === x 轴 label ===
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - 15)   // 放在 x 轴下方
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Model Performance (Mappings from Murty185)");

    // === y 轴 label ===
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)   // 调整与轴的距离
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Model Performance (Mappings from NSD1000)");

    // 散点
    svg.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 5)
      .attr("fill", (d) => color_map[d.dataset])  
      .attr("opacity", 0.4)
      .attr("stroke", "black");

    // tooltip (可选)
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "5px")
      .style("text-align", "left")
      .style("font-size", "14px");

    svg.selectAll("circle")
      .on("mouseover", (event, d) => {
        tooltip
          .style("visibility", "visible")
          .html(`
              <div style="color:#666; margin-bottom:6px;">
                Model: <span style="font-weight:500; color:#333;">${d.model}</span>
              </div>
              <div style="color:#666; margin-bottom:6px;">
                  Evaluation Dataset: <span style="font-weight:500; color:#333;">${d.dataset} (ceiling - ${d.ceiling.toFixed(3)})</span>
              </div>
              <div style="font-weight:600; margin-bottom:4px;">Performance Trained on</div>
              <div>• Murty185 — ${d.x.toFixed(3)}</div>
              <div>• NSD1000 — ${d.y.toFixed(3)}</div>
            `)
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

    // === legend ===

    const legendData = Array.from(new Set(points.map(d => d.dataset)));

    const legendPosition = (legendData.includes("nsd_syn"))
        ? { x: margin.left + 20, y: margin.top + 20 } // 左上角
        : { x: width - 300, y: height - margin.bottom - 150 }; // 默认右下角
      
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${legendPosition.x}, ${legendPosition.y})`);

    legend.selectAll("circle")
      .data(legendData)
      .enter()
      .append("circle")
      .attr("cx", 0)
      .attr("cy", (d, i) => i * 20)  // 垂直排列
      .attr("r", 6)
      .style("fill", (d) => color_map[d])  
      .style("opacity", 0.4)
      .style("stroke", "black");

    legend.selectAll("text")
      .data(legendData)
      .enter()
      .append("text")
      .attr("x", 12)   // 在圆右边
      .attr("y", (d, i) => i * 20 + 4)
      .text(d => d)
      .style("font-size", "14px")
      .attr("alignment-baseline", "middle");


    // =========== 上方直方图 ===========

const datasets = Array.from(new Set(points.map(d => d.dataset))); // 取所有 dataset

// 全局 x 直方图最大 bin count
const allXVals = points.map(d => d.x);
const xHistAll = d3.histogram()
  .domain(xScale.domain())
  .thresholds(xScale.ticks(20))(allXVals);
const globalXMax = d3.max(xHistAll, d => d.length);

// 全局 y 直方图最大 bin count
const allYVals = points.map(d => d.y);
const yHistAll = d3.histogram()
  .domain(yScale.domain())
  .thresholds(yScale.ticks(20))(allYVals);
const globalYMax = d3.max(yHistAll, d => d.length);

// 上方直方图的 y 比例尺（统一用 globalXMax）
const yHistScale = d3.scaleLinear()
  .domain([0, globalXMax])
  .range([histHeight, 0]);

datasets.forEach(dataset => {
  const xVals = points.filter(d => d.dataset === dataset).map(d => d.x);

  const xHist = d3.histogram()
    .domain(xScale.domain())
    .thresholds(xScale.ticks(20))(xVals);

  const topHistGroup = svg.append("g")
    .attr("transform", `translate(0, 0)`);

  topHistGroup.selectAll(`rect.${dataset}`)
    .data(xHist)
    .enter()
    .append("rect")
    .attr("class", dataset)
    .attr("x", d => xScale(d.x0))
    .attr("y", d => yHistScale(d.length))
    .attr("width", d => xScale(d.x1) - xScale(d.x0))
    .attr("height", d => histHeight - yHistScale(d.length))
    .attr("fill", color_map[dataset])
    .attr("opacity", 0.5)
    .attr("stroke","black");
});

// =========== 右侧直方图 ===========

// 右侧直方图的 x 比例尺（统一用 globalYMax）
const xHistScale = d3.scaleLinear()
  .domain([0, globalYMax])
  .range([0, histWidth]);

datasets.forEach(dataset => {
  const yVals = points.filter(d => d.dataset === dataset).map(d => d.y);

  const yHist = d3.histogram()
    .domain(yScale.domain())
    .thresholds(yScale.ticks(20))(yVals);

  const rightHistGroup = svg.append("g")
    .attr("transform", `translate(${mainSize + margin.left + 10}, 0)`);

  rightHistGroup.selectAll(`rect.${dataset}`)
    .data(yHist)
    .enter()
    .append("rect")
    .attr("class", dataset)
    .attr("x", 0)
    .attr("y", d => yScale(d.x1))
    .attr("width", d => xHistScale(d.length))
    .attr("height", d => yScale(d.x0) - yScale(d.x1))
    .attr("fill", color_map[dataset])
    .attr("opacity", 0.5)
    .attr("stroke","black");
});


  const d = [1/Math.sqrt(2), 1/Math.sqrt(2)];
const d_orth = [1/Math.sqrt(2), -1/Math.sqrt(2)];

// 先随便放在中间
const center = [300, -300];

function kernelDensityEstimator(xGrid, sample, bandwidth) {
  const kernel = v => Math.exp(-0.5 * v * v) / Math.sqrt(2 * Math.PI);
  return xGrid.map(x => [
    x,
    d3.mean(sample, v => kernel((x - v) / bandwidth)) / bandwidth
  ]);
}

// ==== 先算全局最大密度 ====
let allProj = [];
datasets.forEach(dataset => {
  const pts = points.filter(p => p.dataset === dataset);
  if (pts.length === 0) return;
  const proj = pts.map(p => xScale(p.x) * d[0] + yScale(p.y) * d[1]);
  allProj = allProj.concat(proj);
});

const uMinAll = d3.min(allProj);
const uMaxAll = d3.max(allProj);
const uGridAll = d3.range(uMinAll, uMaxAll, (uMaxAll - uMinAll) / 100);

const kdeValsAll = kernelDensityEstimator(uGridAll, allProj, 30);
const globalMaxDens = d3.max(kdeValsAll, d => d[1]);

// ==== 每个 dataset 单独画，但高度归一化到 globalMaxDens ====
datasets.forEach(dataset => {
  const pts = points.filter(p => p.dataset === dataset);
  if (pts.length === 0) return;

  // 投影时用 scale 后的坐标
  const proj = pts.map(p => xScale(p.x) * d[0] + yScale(p.y) * d[1]);

  const uMin = d3.min(proj);
  const uMax = d3.max(proj);
  const uGrid = d3.range(uMin, uMax, (uMax - uMin) / 100);

  const kdeVals = kernelDensityEstimator(uGrid, proj, 30);

  const scale = 100; // 固定像素偏移，保证能看见

  const linePts = kdeVals.map(([u, dens]) => {
    const base = [u * d[0], u * d[1]];
    const offset = [(dens / globalMaxDens) * scale * d_orth[0], (dens / globalMaxDens) * scale * d_orth[1]];
    return [center[0] + base[0] + offset[0], center[1] + base[1] + offset[1]];
  });

  console.log("linePts", dataset, linePts);

  const lineGen = d3.line().curve(d3.curveBasis);
  svg.append("path")
    .datum(linePts)
    .attr("d", lineGen)
    .attr("fill", "none")
    .attr("stroke", color_map[dataset])
    .attr("stroke-width", 2)
    .attr("opacity", 0.8);
});









  }, [murtyData, nsdData, roi, dataset]);

  

  return <div style={{ justifyContent: "center"    }}ref={containerRef}></div>;
  
};

export default ScatterMurtyVsNsd;
