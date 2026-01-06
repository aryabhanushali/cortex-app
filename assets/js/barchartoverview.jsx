import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const BarChartOverview = ({ data, roi, dataset, ceiling, rank, onModelClick, selectedModel }) => {
  const containerRef = useRef();
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      // 获取容器实际占用的宽高
      setDimensions({ 
        width: entries[0].contentRect.width, 
        height: entries[0].contentRect.height 
      });
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!data || !roi || !data[roi] || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    // 移除大 Margin，只留极小边距防止点被切掉
    const margin = { top: 5, right: 5, bottom: 5, left: 0 };

    const roiData = data[roi];
    const models = Object.keys(roiData).filter((m) => m !== "ceiling");
    
    let results = models
      .map((model) => ({ model, val: roiData[model]?.[dataset]?.[0] }))
      .filter((d) => d.val !== undefined);

    if (rank && rank !== "") {
      results = [...results].sort((a, b) => d3.descending(a.val, b.val));
    }

    // ==== 比例尺 ====
    const xScale = d3.scalePoint()
      .domain(results.map(d => d.model))
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([-0.2, 1.0]) 
      .range([height - margin.bottom, margin.top]);

    // ==== 1. 绘制 y=0 基准线 (全宽) ====
    svg.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2 2");

    // ==== 2. 绘制折线 ====
    const lineGenerator = d3.line()
      .x(d => xScale(d.model))
      .y(d => yScale(d.val))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(results)
      .attr("fill", "none")
      .attr("stroke", "#1890ff")
      .attr("stroke-width", 1.5)
      .attr("d", lineGenerator);

    // ==== 3. 绘制交互点 ====
    svg.selectAll("circle")
      .data(results)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.model))
      .attr("cy", d => yScale(d.val))
      .attr("r", d => d.model === selectedModel ? 4 : 2)
      .attr("fill", d => d.model === selectedModel ? "#ff4500" : "#1890ff")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        onModelClick?.(d.model === selectedModel ? null : d.model);
      });

    // ==== 4. 内部 Y 轴刻度 (因为没有 Margin，所以画在里面) ====
    [0, 1].forEach(tick => {
      svg.append("text")
        .attr("x", 5)
        .attr("y", yScale(tick) - 2)
        .attr("font-size", "9px")
        .attr("fill", "#ccc")
        .text(tick);
    });

  }, [data, roi, dataset, rank, dimensions, selectedModel]);

  return (
    <div style={{ 
      display: "flex", 
      width: "100%", 
      height: "100%", 
      alignItems: "center",
      background: "transparent" // 去掉白色背景
    }}>
      {/* 左侧 Dataset:ROI 标题 */}
      <div style={{ 
        width: "110px", 
        paddingRight: "10px", 
        fontSize: "10px", 
        color: "#999", 
        textAlign: "right",
        flexShrink: 0,
        lineHeight: "1.1",
        fontWeight: 500
      }}>
        <div style={{ color: "#666" }}>{dataset}</div>
        <div style={{ fontWeight: "bold" }}>{roi}</div>
      </div>

      {/* 绘图区 */}
      <div 
        ref={containerRef} 
        style={{ flex: 1, height: "100%", position: "relative" }}
      >
        <svg ref={svgRef} width={dimensions.width} height={dimensions.height} style={{ display: "block" }}></svg>
      </div>
    </div>
  );
};

export default BarChartOverview;