import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const LineChartROIDataset = ({ data, roi, dataset, ceiling, rank, onModelClick, selectedModel }) => {
  const containerRef = useRef();
  const svgRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height: 120 });

  // 1. 监听容器宽度
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      setDimensions((prev) => ({ ...prev, width: entries[0].contentRect.width }));
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    // 确保有足够的数据进行渲染
    if (!data || !roi || !data[roi] || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 20, bottom: 25, left: 40 };

    // ==== 2. 数据处理 ====
    const roiData = data[roi];
    const models = Object.keys(roiData).filter((m) => m !== "ceiling");
    
    let results = models
      .map((model) => {
        // 根据传入的 dataset 获取具体数值
        const val = roiData[model]?.[dataset]?.[0];
        return { model, val };
      })
      .filter((d) => d.val !== undefined);

    // 排序逻辑
    if (rank && rank !== "") {
      results = [...results].sort((a, b) => d3.descending(a.val, b.val));
    }

    const ceilingMean = ceiling?.[roi]?.[dataset]?.ceiling_mean ?? null;

    // ==== 3. 比例尺 ====
    const xScale = d3.scalePoint()
      .domain(results.map(d => d.model))
      .range([margin.left, width - margin.right]);

    // 动态 Y 轴，确保包含 0 和 1 (或数据中的极值)
    const minY = d3.min(results, d => d.val) < -0.1 ? d3.min(results, d => d.val) : -0.2;
    const yScale = d3.scaleLinear()
      .domain([minY, 1.0]) 
      .range([height - margin.bottom, margin.top]);

    // ==== 4. 绘制 y=0 基准线 (关键新增) ====
    svg.append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0))
      .attr("stroke", "#999") // 深灰色
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2 2") // 虚线表示
      .style("opacity", 0.8);

    // ==== 5. 绘制 Ceiling 线 (可选) ====
    if (ceilingMean !== null) {
      svg.append("line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", yScale(ceilingMean))
        .attr("y2", yScale(ceilingMean))
        .attr("stroke", "#ff4d4f")
        .attr("stroke-dasharray", "4 4")
        .attr("opacity", 0.5);
    }

    // ==== 6. 绘制折线 ====
    const lineGenerator = d3.line()
      .x(d => xScale(d.model))
      .y(d => yScale(d.val))
      .curve(d3.curveMonotoneX);

    svg.append("path")
      .datum(results)
      .attr("fill", "none")
      .attr("stroke", "#1890ff")
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);

    // ==== 7. 绘制交互点 ====
    svg.selectAll("circle.dot")
      .data(results)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.model))
      .attr("cy", d => yScale(d.val))
      .attr("r", d => d.model === selectedModel ? 5 : 3.5)
      .attr("fill", d => d.model === selectedModel ? "#ff4500" : "#1890ff")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        if (onModelClick) {
          onModelClick(d.model === selectedModel ? null : d.model);
        }
      });

    // ==== 8. 坐标轴渲染 ====
    // 只显示 0 和 1 的刻度标签
    const yAxis = d3.axisLeft(yScale)
      .tickValues([0, 0.5, 1.0])
      .tickFormat(d3.format(".1f"));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove()); // 移除轴线，保持简洁

  }, [data, roi, dataset, ceiling, rank, dimensions, selectedModel]);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        width: "100%", 
        height: "100%", // 稍微增加一点高度
        backgroundColor: "#fafafa",
        border: "1px solid #f0f0f0",
        borderRadius: "8px",
        overflow: "hidden",
        marginTop: "10px"
      }}
    >
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}></svg>
    </div>
  );
};

export default LineChartROIDataset;