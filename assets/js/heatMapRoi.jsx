// components/HeatmapByROI.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const HeatmapByROI = ({ data, roi, dataset }) => {
  const headerRef = useRef();
  const bodyRef = useRef();
  const legendRef = useRef();

  useEffect(() => {
    if (!data) return;

    d3.select(headerRef.current).select("svg").remove();
    d3.select(bodyRef.current).select("svg").remove();
    d3.select(legendRef.current).select("svg").remove();

    const headerMargin = { top: 60, right: 40, bottom: 10, left: 200 };
    const bodyMargin = { top: 0, right: 40, bottom: 0, left: 200 };
    const rowHeight = 25;
    const rowGap = 2;
    const columnWidth = 120;
    const columnGap = 5;

    const colorScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range(["#D3D3D3", "#9CC9FF"]);

    let xLabels = [];
    let models = [];
    let cellData = [];
    let ceilingData = [];

    if (roi) {
      // ✅ case 1: 固定 ROI，横轴 dataset
      models = Object.keys(data[roi] || {}).filter((m) => m !== "ceiling");
      xLabels = Array.from(
        new Set(models.flatMap((m) => Object.keys(data[roi][m] || {})))
      );

      models.forEach((model) => {
        xLabels.forEach((ds) => {
          const vals = data[roi][model]?.[ds];
          const score = vals?.[1];
          if (score != null) {
            cellData.push({ model, x: ds, value: score });
          }
        });
      });

      // ceiling 在 header
      ceilingData = xLabels.map((ds) => {
        const score = data[roi]?.ceiling?.[ds]?.[1];
        return { x: ds, value: score };
      });
    } else if (dataset) {
      // ✅ case 2: 固定 Dataset，横轴 ROI
      const rois = Object.keys(data).filter(
        (roiName) => roiName.toLowerCase() !== "overall" // 🚫 不画 overall
      );

      models = [];
      let validRois = [];

      rois.forEach((roiName) => {
        const modelNames = Object.keys(data[roiName] || {}).filter(
          (m) => m !== "ceiling"
        );
        models = Array.from(new Set([...models, ...modelNames]));

        let roiHasData = false;

        // 模型数据
        modelNames.forEach((model) => {
          const vals = data[roiName]?.[model]?.[dataset];
          const score = vals?.[1];
          if (score != null) {
            roiHasData = true;
            cellData.push({ model, x: roiName, value: score });
          }
        });

        // ceiling 数据
        const ceilingScore = data[roiName]?.ceiling?.[dataset]?.[1];
        if (ceilingScore != null) {
          roiHasData = true;
          ceilingData.push({ x: roiName, value: ceilingScore });
        }

        if (roiHasData) {
          validRois.push(roiName); // 只保留有数据的 ROI
        }
      });

      // 只保留有数据的 ROI 作为横轴
      xLabels = validRois;
    } else {
      return; // roi 和 dataset 都没传，不画
    }

    // ======= dimensions =======
    const chartWidth = xLabels.length * (columnWidth + columnGap);
    const bodyHeight = models.length * (rowHeight + rowGap);
    const width = chartWidth + headerMargin.left + headerMargin.right;

    // ======= Header (x labels + ceiling) =======
    const headerHeight = headerMargin.top + rowHeight;
    const svgHeader = d3
      .select(headerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", headerHeight);

    // 顶部的 X 轴标签
    svgHeader
      .append("g")
      .attr(
        "transform",
        `translate(${columnWidth / 4},${headerMargin.top - 20})`
      )
      .call(
        d3
          .axisTop(
            d3
              .scalePoint()
              .domain(xLabels)
              .range([
                headerMargin.left + columnWidth / 2,
                headerMargin.left +
                  xLabels.length * (columnWidth + columnGap) -
                  columnGap -
                  columnWidth / 2,
              ])
          )
      )
      .call((g) => {
        g.select(".domain").remove();
        g.selectAll("line").remove();
        g.selectAll("text").style("font-size", "14px").style("fill", "black");
      })
      .selectAll("text")
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    // ceiling 行（固定在 header）
    svgHeader
      .selectAll("rect.ceiling")
      .data(ceilingData)
      .enter()
      .append("rect")
      .attr("class", "ceiling")
      .attr(
        "x",
        (d) =>
          headerMargin.left +
          xLabels.indexOf(d.x) * (columnWidth + columnGap)
      )
      .attr("y", headerMargin.top)
      .attr("width", columnWidth)
      .attr("height", rowHeight)
      .attr("fill", (d) =>
        d.value != null ? colorScale(d.value) : "#f0f0f0"
      );

    svgHeader
      .selectAll("text.ceiling-label")
      .data(ceilingData.filter((d) => d.value != null))
      .enter()
      .append("text")
      .attr("class", "ceiling-label")
      .attr(
        "x",
        (d) =>
          headerMargin.left +
          xLabels.indexOf(d.x) * (columnWidth + columnGap) +
          columnWidth / 2
      )
      .attr("y", headerMargin.top + rowHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("fill", "black")
      .style("font-size", "14px")
      .text((d) => d.value.toFixed(2));

    // Y 轴只有 "ceiling"
    svgHeader
      .append("g")
      .attr("transform", `translate(${headerMargin.left - 10},0)`)
      .call(
        d3
          .axisLeft(
            d3
              .scalePoint()
              .domain(["ceiling"])
              .range([
                headerMargin.top + rowHeight / 2,
                headerMargin.top + rowHeight / 2,
              ])
          )
      )
      .call((g) => {
        g.select(".domain").remove();
        g.selectAll("line").remove();
        g.selectAll("text").style("font-size", "14px").style("fill", "black");
      });

    // ======= Body (models) =======
    const svgBody = d3
      .select(bodyRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", bodyHeight);

    svgBody
      .selectAll("rect.cell")
      .data(cellData)
      .enter()
      .append("rect")
      .attr("class", "cell")
      .attr(
        "x",
        (d) =>
          bodyMargin.left +
          xLabels.indexOf(d.x) * (columnWidth + columnGap)
      )
      .attr(
        "y",
        (d) => bodyMargin.top + models.indexOf(d.model) * (rowHeight + rowGap)
      )
      .attr("width", columnWidth)
      .attr("height", rowHeight)
      .attr("fill", (d) =>
        d.value != null ? (d.value < 0 ? "#D3D3D3" : colorScale(d.value)) : "#f0f0f0"
      );

    svgBody
      .selectAll("text.cell-label")
      .data(cellData.filter((d) => d.value != null))
      .enter()
      .append("text")
      .attr(
        "x",
        (d) =>
          bodyMargin.left +
          xLabels.indexOf(d.x) * (columnWidth + columnGap) +
          columnWidth / 2
      )
      .attr(
        "y",
        (d) =>
          bodyMargin.top +
          models.indexOf(d.model) * (rowHeight + rowGap) +
          rowHeight / 2
      )
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("fill", "black")
      .style("font-size", "14px")
      .text((d) => d.value.toFixed(2));

    // Y 轴 (models)
    svgBody
      .append("g")
      .attr("transform", `translate(${bodyMargin.left - 10},0)`)
      .call(
        d3
          .axisLeft(
            d3
              .scalePoint()
              .domain(models)
              .range([
                bodyMargin.top + rowHeight / 2,
                bodyMargin.top +
                  models.length * (rowHeight + rowGap) -
                  rowGap -
                  rowHeight / 2,
              ])
          )
      )
      .call((g) => {
        g.select(".domain").remove();
        g.selectAll("text").style("font-size", "14px").style("fill", "black");
      });

    // ======= Legend =======
    const legendHeight = 250;
    const legendWidth = 12;
    const svgLegend = d3
      .select(legendRef.current)
      .append("svg")
      .attr("width", 80)
      .attr("height", legendHeight + 40);

    const defs = svgLegend.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "legend-gradient-vertical")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "0%")
      .attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#D3D3D3");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#9CC9FF");

    svgLegend
      .append("rect")
      .attr("x", 30)
      .attr("y", 20)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient-vertical)");

    const legendScale = d3.scaleLinear().domain([0, 1]).range([legendHeight + 20, 20]);
    svgLegend
      .append("g")
      .attr("transform", `translate(42,0)`)
      .call(d3.axisRight(legendScale).ticks(5));
  }, [data, roi, dataset]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
      }}
    >
      <div style={{ flex: 0, alignSelf: "flex-start" }}>
        <div
          ref={headerRef}
          style={{ lineHeight: "0", alignSelf: "flex-start" }}
        ></div>
        <div
          ref={bodyRef}
          style={{
            maxHeight: "400px",
            overflowY: "scroll",
            marginTop: "10px",
          }}
        ></div>
      </div>
      <div
        ref={legendRef}
        style={{ marginLeft: "0px", marginTop: "100px" }}
      ></div>
    </div>
  );
};

export default HeatmapByROI;
