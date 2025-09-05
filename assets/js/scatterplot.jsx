import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import uniIcon from "../img/scatterplot/uni.webp";
import multiIcon from "../img/scatterplot/multi.webp";
   
const ScatterMurtyVsNsd = ({ murtyData, nsdData, roi, dataset, chartType, showOverlay }) => {
  const containerRef = useRef();

  useEffect(() => {
    if (!murtyData || !nsdData) return;

    d3.select(containerRef.current).select("svg").remove();

    const width = 910;
    const height = 930;
    const margin = { top: 190, right: 160, bottom: 50, left: 50 };
    const mainSize = 700;
    const histHeight = 150;
    const histWidth = 150;

    const color_map = {
      "bold_5000": "#1f78b4",
      "bonner_2021": "#4dd0e1",
      "bmd_2024": "#60bd68",
      "kingbaker_2019": "#9e75d6",
      "wardle_2020": "#e377c2",
      "nsd_syn": "#ffdd57"
    };

    const datasetLabelMap = {
      murty185: "Murty185",
      nsd_1000: "NSD1000",
      bold_5000: "BOLD5000v2",
      bonner_2021: "Bonner2021",
      bmd_2024: "BMD2024",
      kingbaker_2019: "King2019",
      wardle_2020: "Wardle2020",
      nsd_syn: "NSD synthetic",
    };

    const svg = d3.select(containerRef.current).append("svg")
      .attr("width", width)
      .attr("height", height);

    // ===== 整理点 =====
    const points = [];
    Object.keys(murtyData[roi] || {}).forEach((model) => {
      if (model === "ceiling") return; 
      const murtyVals = murtyData[roi][model];
      const nsdVals = nsdData[roi][model];
      if (!murtyVals || !nsdVals) return;
      Object.keys(murtyVals).forEach((ds) => {
        if (dataset && ds !== dataset) return;
        if (["murty185", "nsd_1000", "ceiling"].includes(ds)) return;
        const x = murtyVals[ds]?.[0];
        const y = nsdVals[ds]?.[0];
        if (x != null && y != null) points.push({ model, dataset: ds, x, y });
      });
    });

    // ===== scales =====
    // const minVal = Math.min(d3.min(points, d => d.x), d3.min(points, d => d.y)) - 0.05;
    // const maxVal = Math.max(d3.max(points, d => d.x), d3.max(points, d => d.y)) + 0.05;
    // const minVal = Math.min(d3.min(points, d => d.x), d3.min(points, d => d.y)) - 0.05;
    // const maxVal = Math.max(d3.max(points, d => d.x), d3.max(points, d => d.y)) + 0.05;
    // const xScale = d3.scaleLinear().domain([minVal, maxVal]).range([margin.left, width - margin.right]);
    // const yScale = d3.scaleLinear().domain([minVal, maxVal]).range([height - margin.bottom, margin.top]);

    // let allVals = [];
    // Object.keys(murtyData[roi] || {}).forEach((model) => {
    //   if (model === "ceiling") return;
    //   const murtyVals = murtyData[roi][model];
    //   const nsdVals = nsdData[roi][model];
    //   if (!murtyVals || !nsdVals) return;
    //   Object.keys(murtyVals).forEach((ds) => {
    //     if (["murty185", "nsd_1000", "ceiling"].includes(ds)) return;
    //     const x = murtyVals[ds]?.[0];
    //     const y = nsdVals[ds]?.[0];
    //     if (x != null && y != null) allVals.push(x, y);
    //   });
    // });
    // const minVal = d3.min(allVals) - 0.05;
    // const maxVal = d3.max(allVals) + 0.05;

    // const xScale = d3.scaleLinear().domain([minVal, maxVal]).range([margin.left, width - margin.right]);
    // const yScale = d3.scaleLinear().domain([minVal, maxVal]).range([height - margin.bottom, margin.top]);

    // ===== 全局 min/max（跨所有 ROI） =====
    let allVals = [];
    Object.keys(murtyData || {}).forEach((roiKey) => {
      Object.keys(murtyData[roiKey] || {}).forEach((model) => {
        if (model === "ceiling") return;
        const murtyVals = murtyData[roiKey][model];
        const nsdVals = nsdData[roiKey][model];
        if (!murtyVals || !nsdVals) return;
        Object.keys(murtyVals).forEach((ds) => {
          if (["murty185", "nsd_1000", "ceiling"].includes(ds)) return;
          const x = murtyVals[ds]?.[0];
          const y = nsdVals[ds]?.[0];
          if (x != null && y != null) allVals.push(x, y);
        });
      });
    });

    const minVal = d3.min(allVals) - 0.05;
    const maxVal = d3.max(allVals) + 0.05;

    const xScale = d3.scaleLinear().domain([minVal, maxVal]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([minVal, maxVal]).range([height - margin.bottom, margin.top]);


    // 坐标轴
    svg.append("g").attr("transform", `translate(0,${height - margin.bottom})`).call(d3.axisBottom(xScale));
    svg.append("g").attr("transform", `translate(${margin.left},0)`).call(d3.axisLeft(yScale));

    // y=x 参考线
    svg.append("line")
      .attr("x1", xScale(minVal))
      .attr("y1", yScale(minVal))
      .attr("x2", xScale(maxVal+0.2))
      .attr("y2", yScale(maxVal+0.2))
      .attr("stroke", "black")
      .attr("stroke-dasharray", "4 2")
      .attr("opacity", 0.5);

    // 散点
    svg.selectAll("circle")
      .data(points)
      .enter().append("circle")
      .attr("cx", d => xScale(d.x))
      .attr("cy", d => yScale(d.y))
      .attr("r", 5)
      .attr("fill", d => color_map[d.dataset])
      .attr("opacity", 0.4)
      .attr("stroke", "black");

    // ===== legend 固定左上角 =====
    const legendData = Array.from(new Set(points.map(d => d.dataset)));
    const legend = svg.append("g").attr("class", "legend")
      .attr("transform", `translate(${margin.left + 20}, ${margin.top + 20})`);
    legend.selectAll("circle")
      .data(legendData).enter().append("circle")
      .attr("cx", 0).attr("cy", (d,i) => i*20).attr("r", 6)
      .style("fill", d => color_map[d]).style("opacity", 0.4).style("stroke", "black");
    legend.selectAll("text")
      .data(legendData).enter().append("text")
      .attr("x", 12).attr("y", (d,i) => i*20+4)
      .text(d => datasetLabelMap[d] || d)
      .style("font-size", "14px").attr("alignment-baseline", "middle");

    // ===== 全局直方图最大值（固定 scale） =====
    let allGlobalPoints = [];
    Object.keys(murtyData[roi] || {}).forEach((model) => {
      if (model === "ceiling") return;
      const murtyVals = murtyData[roi][model];
      const nsdVals = nsdData[roi][model];
      if (!murtyVals || !nsdVals) return;
      Object.keys(murtyVals).forEach((ds) => {
        if (["murty185","nsd_1000","ceiling"].includes(ds)) return;
        const x = murtyVals[ds]?.[0];
        const y = nsdVals[ds]?.[0];
        if (x != null && y != null) allGlobalPoints.push({x,y});
      });
    });
    const allXVals = allGlobalPoints.map(d => d.x);
    const allYVals = allGlobalPoints.map(d => d.y);
    const globalXMax = d3.max(d3.histogram().domain(xScale.domain()).thresholds(xScale.ticks(20))(allXVals), d => d.length) || 1;
    const globalYMax = d3.max(d3.histogram().domain(yScale.domain()).thresholds(yScale.ticks(20))(allYVals), d => d.length) || 1;

    const yHistScale = d3.scaleLinear().domain([0, globalXMax]).range([histHeight, 0]);
    const xHistScale = d3.scaleLinear().domain([0, globalYMax]).range([0, histWidth]);

    const datasets = Array.from(new Set(points.map(d => d.dataset)));

    // 上方直方图
    datasets.forEach(ds => {
      const xVals = points.filter(d => d.dataset === ds).map(d => d.x);
      const xHist = d3.histogram().domain(xScale.domain()).thresholds(xScale.ticks(20))(xVals);
      const topHistGroup = svg.append("g");
      topHistGroup.selectAll(`rect.${ds}`)
        .data(xHist).enter().append("rect")
        .attr("x", d => xScale(d.x0))
        .attr("y", d => yHistScale(d.length))
        .attr("width", d => xScale(d.x1) - xScale(d.x0))
        .attr("height", d => histHeight - yHistScale(d.length))
        .attr("fill", color_map[ds]).attr("opacity", 0.5).attr("stroke","black");
    });

    // 右侧直方图
    datasets.forEach(ds => {
      const yVals = points.filter(d => d.dataset === ds).map(d => d.y);
      const yHist = d3.histogram().domain(yScale.domain()).thresholds(yScale.ticks(20))(yVals);
      const rightHistGroup = svg.append("g").attr("transform", `translate(${mainSize + margin.left + 10}, 0)`);
      rightHistGroup.selectAll(`rect.${ds}`)
        .data(yHist).enter().append("rect")
        .attr("x", 0)
        .attr("y", d => yScale(d.x1))
        .attr("width", d => xHistScale(d.length))
        .attr("height", d => yScale(d.x0) - yScale(d.x1))
        .attr("fill", color_map[ds]).attr("opacity", 0.5).attr("stroke","black");
    });

    // ===== KDE 曲线 =====
    const dVec = [1/Math.sqrt(2), 1/Math.sqrt(2)];
    const d_orth = [1/Math.sqrt(2), -1/Math.sqrt(2)];
    const center = [300, -300];
    function kernelDensityEstimator(xGrid, sample, bandwidth) {
      const kernel = v => Math.exp(-0.5 * v * v) / Math.sqrt(2 * Math.PI);
      return xGrid.map(x => [x, d3.mean(sample, v => kernel((x - v) / bandwidth)) / bandwidth]);
    }
    let allProj = [];
    datasets.forEach(ds => {
      const pts = points.filter(p => p.dataset === ds);
      const proj = pts.map(p => xScale(p.x)*dVec[0] + yScale(p.y)*dVec[1]);
      allProj = allProj.concat(proj);
    });
    const uMinAll = d3.min(allProj);
    const uMaxAll = d3.max(allProj);
    const uGridAll = d3.range(uMinAll, uMaxAll, (uMaxAll-uMinAll)/100);
    const kdeValsAll = kernelDensityEstimator(uGridAll, allProj, 30);
    const globalMaxDens = d3.max(kdeValsAll, d => d[1]);
    datasets.forEach(ds => {
      const pts = points.filter(p => p.dataset === ds);
      if (!pts.length) return;
      const proj = pts.map(p => xScale(p.x)*dVec[0] + yScale(p.y)*dVec[1]);
      const uMin = d3.min(proj);
      const uMax = d3.max(proj);
      const uGrid = d3.range(uMin, uMax, (uMax-uMin)/100);
      const kdeVals = kernelDensityEstimator(uGrid, proj, 30);
      const scale = 100;
      const linePts = kdeVals.map(([u,dens]) => {
        const base = [u*dVec[0], u*dVec[1]];
        const offset = [(dens/globalMaxDens)*scale*d_orth[0], (dens/globalMaxDens)*scale*d_orth[1]];
        return [center[0]+base[0]+offset[0], center[1]+base[1]+offset[1]];
      });
      const lineGen = d3.line().curve(d3.curveBasis);
      svg.append("path")
        .datum(linePts).attr("d", lineGen)
        .attr("fill","none").attr("stroke", color_map[ds])
        .attr("stroke-width", 2).attr("opacity",0.8);
    });

    // ===== overlay 保留 =====
    if (showOverlay) {
      svg.append("image")
        .attr("href", chartType === "uni" ? uniIcon : multiIcon) 
        .attr("x", width - margin.right - 200)
        .attr("y", height - margin.bottom - 170)
        .attr("width", 200)
        .attr("height", 160)
        .attr("opacity", 0.7)
        .style("cursor", "pointer");
    }

  }, [murtyData, nsdData, roi, dataset]);

  return <div style={{ justifyContent: "center" }} ref={containerRef}></div>;
};

export default ScatterMurtyVsNsd;
