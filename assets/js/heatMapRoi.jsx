// components/HeatmapByROI.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const HeatmapByROI = ({ data, roi, title }) => {
  const headerRef = useRef();
  const bodyRef = useRef();
  const legendRef = useRef();

  useEffect(() => {
    if (!data || !roi || !data[roi]) return;

    d3.select(headerRef.current).select("svg").remove();
    d3.select(bodyRef.current).select("svg").remove();
    d3.select(legendRef.current).select("svg").remove();

    const headerMargin = { top: 80, right: 40, bottom: 0, left: 200 };
    const bodyMargin = { top: 0, right: 40, bottom: 0, left: 200 };
    const rowHeight = 25;
    const rowGap = 2;
    const columnWidth = 120;
    const columnGap = 5;

    let models = Object.keys(data[roi] || {});
    const hasCeiling = models.includes("ceiling");
    const otherModels = models.filter((m) => m !== "ceiling");

    const datasets = Array.from(
      new Set(models.flatMap((m) => Object.keys(data[roi][m] || {})))
    );

    const chartWidth = datasets.length * (columnWidth + columnGap);
    const bodyHeight = otherModels.length * (rowHeight + rowGap);
    const width = chartWidth + headerMargin.left + headerMargin.right;

    const colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([0, 1]);

    // ======= Header SVG =======
    const headerHeight = headerMargin.top + rowHeight;
    const svgHeader = d3
      .select(headerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", headerHeight);

    // Title
    svgHeader
      .append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .text(title || `${roi.toUpperCase()} — Heatmap`);

    // Dataset labels
    svgHeader
    .append("g")
    .attr("transform", `translate(${columnWidth / 4},${headerMargin.top - 20})`)
    .call(
        d3.axisTop(
        d3.scalePoint()
            .domain(datasets)
            .range([
            headerMargin.left + columnWidth / 2,
            headerMargin.left +
                datasets.length * (columnWidth + columnGap) -
                columnGap -
                columnWidth / 2,
            ])
        )
    )
    .call(g => {
        g.select(".domain").remove();   // 去掉横线
        g.selectAll("line").remove();   // 去掉小刻度
    })
    .selectAll("text")
    .attr("transform", "rotate(-30)")
    .style("text-anchor", "end");


    if (hasCeiling) {
      const ceilingData = [];
      datasets.forEach((dataset) => {
        const vals = data[roi]["ceiling"]?.[dataset];
        const score = vals?.[1];
        ceilingData.push({ model: "ceiling", dataset, value: score });
      });

      svgHeader
        .selectAll("rect")
        .data(ceilingData)
        .enter()
        .append("rect")
        .attr(
          "x",
          (d) =>
            headerMargin.left +
            datasets.indexOf(d.dataset) * (columnWidth + columnGap)
        )
        .attr("y", headerMargin.top)
        .attr("width", columnWidth)
        .attr("height", rowHeight)
        .attr("fill", (d) =>
          d.value != null ? colorScale(d.value) : "#f0f0f0"
        );

      svgHeader
        .selectAll("text.cell-label")
        .data(ceilingData.filter((d) => d.value != null))
        .enter()
        .append("text")
        .attr(
          "x",
          (d) =>
            headerMargin.left +
            datasets.indexOf(d.dataset) * (columnWidth + columnGap) +
            columnWidth / 2
        )
        .attr("y", headerMargin.top + rowHeight / 2)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "central")
        .style("fill", "black")
        .style("font-size", "10px")
        .text((d) => d.value.toFixed(2));

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
        );
    }

    // ======= Body SVG (scrollable models) =======
    const svgBody = d3
      .select(bodyRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", bodyHeight);

    const cellData = [];
    otherModels.forEach((model) => {
      datasets.forEach((dataset) => {
        const vals = data[roi][model]?.[dataset];
        const score = vals?.[1];
        cellData.push({ model, dataset, value: score });
      });
    });

    svgBody
      .selectAll("rect")
      .data(cellData)
      .enter()
      .append("rect")
      .attr(
        "x",
        (d) =>
          bodyMargin.left +
          datasets.indexOf(d.dataset) * (columnWidth + columnGap)
      )
      .attr(
        "y",
        (d) => otherModels.indexOf(d.model) * (rowHeight + rowGap)
      )
      .attr("width", columnWidth)
      .attr("height", rowHeight)
      .attr("fill", (d) =>
        d.value != null ? colorScale(d.value) : "#f0f0f0"
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
          datasets.indexOf(d.dataset) * (columnWidth + columnGap) +
          columnWidth / 2
      )
      
      .attr(
        "y",
        (d) =>
          otherModels.indexOf(d.model) * (rowHeight + rowGap) +
          rowHeight / 2
      )
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("fill", "black")
      .style("font-size", "10px")
      .text((d) => d.value.toFixed(2));

     svgBody
    .append("g")
    .attr("transform", `translate(${bodyMargin.left - 10},0)`)
    .call(
        d3.axisLeft(
        d3.scalePoint()
            .domain(otherModels)
            .range([
            rowHeight / 2,
            otherModels.length * (rowHeight + rowGap) -
                rowGap -
                rowHeight / 2,
            ])
        )
    )
    .call(g => {
        g.select(".domain").remove();   // 去掉竖的黑框线
        // g.selectAll("line").remove();   // 去掉小刻度
    });

    // ======= Legend (右侧竖直 colorbar) =======
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

    d3.range(0, 1.01, 0.1).forEach((t) => {
      gradient
        .append("stop")
        .attr("offset", `${t * 100}%`)
        .attr("stop-color", colorScale(t));
    });

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
  }, [data, roi, title]);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ flex: 1 }}>
        <div
          ref={headerRef}
          style={{
            marginTop: "-20px", // ✅ 保留你原来的
          }}
        ></div>
        <div
          ref={bodyRef}
          style={{
            maxHeight: "300px",
            overflowY: "scroll",
            marginTop: "-65px", // ✅ 保留你原来的
          }}
        ></div>
      </div>
      <div ref={legendRef} style={{ marginLeft: "0px", marginTop: "150px", }}></div>
    </div>
  );
};

export default HeatmapByROI;
