import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const RoiBarChart = ({ data, roi, dataset, ceiling,rank }) => {
  const ceilingRef = useRef();
  const barsRef = useRef();
  const [stats, setStats] = useState({ max: null, mean: null });
  const [scaleY, setScaleY] = useState(null);

  useEffect(() => {
    console.log("🔍 RoiBarChart props:", { roi, dataset, ceiling, data });

    if (!data || !roi || !data[roi]) return;
    if (!ceiling || !ceiling[roi] || !ceiling[roi][dataset]) return;

    const roiData = data[roi];

    // ==== 数据处理 ====
    const models = Object.keys(roiData).filter((m) => m !== "ceiling");
    let results = models
      .map((model) => {
        const val = roiData[model]?.[dataset]?.[0];
        return { model, val };
      })
      .filter((d) => d.val !== undefined);

     if (rank && rank !== "") {
      results = [...results].sort((a, b) => d3.descending(a.val, b.val));
    }

    const ceilingMean = ceiling[roi][dataset]?.ceiling_mean ?? null;
    const ceilingMax = ceiling[roi][dataset]?.ceiling_max ?? null;

    setStats({ max: ceilingMax, mean: ceilingMean });

    // ==== 尺寸 ====
    const barWidth = 30;
    const margin = { top: 10, right: 20, bottom: 180, left: 60 };
    const height = 400;

    // ==== 动态 y domain ====
    const allVals = results.map((d) => d.val)
      .concat([ceilingMean, ceilingMax])
      .filter((v) => v != null);

    const maxVal = d3.max(allVals);
    const minVal = d3.min(allVals);

    const y = d3
      .scaleLinear()
      .domain([Math.min(0, minVal), Math.max(1.0, maxVal * 1.1)]) // 自动扩展
      .range([height - margin.bottom, margin.top]);

    setScaleY(() => y);

    // ================= 左边 ceiling SVG =================
    const ceilingSvg = d3.select(ceilingRef.current);
    ceilingSvg.selectAll("*").remove();
    const ceilingWidth = margin.left + 50;

    ceilingSvg.attr("width", ceilingWidth).attr("height", height);

    // ceiling bar
    if (ceilingMax != null) {
      ceilingSvg
        .append("rect")
        .attr("x", margin.left + 15)
        .attr("y", Math.min(y(0), y(ceilingMax)))
        .attr("width", barWidth)
        .attr("height", Math.abs(y(0) - y(ceilingMax)))
        .attr("fill", "#d3d3d3")
        .attr("stroke", "black");
      ceilingSvg
        .append("text")
        .attr("x", margin.left + 15 + barWidth / 2)
        .attr("y", y(ceilingMax) - 10)  // 上方 10px
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "black")
        .text(ceilingMax.toFixed(2));

      // 如果有 correlation_points，就画小蓝点
     const points = ceiling[roi][dataset]?.correlation_points || [];
      if (points.length > 0) {
        const jitter = d3.scaleLinear()
          .domain([0, points.length - 1])
          .range([-barWidth / 4, barWidth / 4]); // 控制水平散开范围

        ceilingSvg
          .append("g")
          .selectAll("circle")
          .data(points)
          .enter()
          .append("circle")
          .attr("cx", (_, i) => margin.left + 15 + barWidth / 2 + jitter(i))
          .attr("cy", (d) => y(d))
          .attr("r", 5)
          .attr("fill", "#74C5F7")
          .attr("stroke", "black")
          .attr("stroke-width", 0.6);
      }
    }

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

    // y 轴 label
      const centerY = (height - margin.bottom) / 2;

      ceilingSvg
        .append("text")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .attr("fill", "black")
        // 先平移到 margin.left - 45 的 X，centerY 的 Y
        // 再绕这个点旋转 -90 度
        .attr("transform", `translate(${margin.left - 45}, ${centerY}) rotate(-90)`)
        .text("Pearson Correlation");
    // x label for ceiling
    ceilingSvg
      .append("text")
      .attr("x", margin.left + barWidth / 2 + 15)
      .attr("y", height - margin.bottom + 10)
      .attr("text-anchor", "start")
      .attr("font-size", "9px")
      .attr("fill", "black")
      .attr(
        "transform",
        `rotate(60, ${margin.left + barWidth / 2 + 15}, ${height - margin.bottom + 10})`
      )
      .text("Ceiling");

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
      .attr("y", (d) => Math.min(y(0), y(d.val)))
      .attr("height", (d) => Math.abs(y(0) - y(d.val)))
      .attr("width", x.bandwidth())
      .attr("fill", "#d3d3d3")
      .attr("stroke", "black");

    // bar 数值 label (统一在 bar 顶部 5px 位置)
    barsSvg
      .append("g")
      .selectAll("text.value-label")
      .data(results)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.model) + x.bandwidth() / 2)
      .attr("y", (d) => y(d.val) - 10) // bar 顶端上方 5px
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "black")
      .text((d) => d.val.toFixed(2));

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

    function drawLine(svg, value, color, svgWidth, offsetX = 0) {
      if (value == null) return;

      const [yMin, yMax] = y.domain();
      const safeVal = Math.min(Math.max(value, yMin), yMax);

      svg
        .append("line")
        .attr("x1", offsetX)
        .attr("x2", svgWidth)
        .attr("y1", y(safeVal))
        .attr("y2", y(safeVal))
        .attr("stroke", color)
        .attr("stroke-dasharray", "4 2")
        .attr("stroke-width", 1);
    }

    // 画 ceiling mean/max
    drawLine(ceilingSvg, ceilingMax, "red", ceilingWidth, margin.left);
    drawLine(ceilingSvg, ceilingMean, "blue", ceilingWidth, margin.left);
    drawLine(barsSvg, ceilingMax, "red", width, 0);
    drawLine(barsSvg, ceilingMean, "blue", width, 0);
  }, [data, roi, dataset, ceiling,rank]);

  return (
    <div style={{ display: "flex", flexDirection: "row", position: "relative" }}>
      {/* 左边 ceiling + y 轴 */}
      <div>
        <svg ref={ceilingRef}></svg>
      </div>

      {/* 右边模型 bars */}
      <div style={{ overflowX: "auto" }}>
        <svg ref={barsRef}></svg>
      </div>

      {/* 固定在右边的 label */}
      {scaleY && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: "150px",
            pointerEvents: "none",
          }}
        >
          {stats.max !== null && (
            <div
              style={{
                position: "absolute",
                top: scaleY(stats.max) - 60,
                right: 0,
                color: "red",
                fontSize: "12px",
              }}
            >
              Ceiling Max: {stats.max.toFixed(2)}
            </div>
          )}
          {stats.mean !== null && (
            <div
              style={{
                position: "absolute",
                top: scaleY(stats.mean) - 60,
                right: 0,
                color: "blue",
                fontSize: "12px",
              }}
            >
              Ceiling Mean: {stats.mean.toFixed(2)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RoiBarChart;
