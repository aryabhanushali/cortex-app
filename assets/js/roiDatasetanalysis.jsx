// ScatterGapCeiling.jsx
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const roiColors = { ppa: "#1f77b4", ffa: "#ff7f0e", eba: "#2ca02c" };
const roiSize = { ppa: 120, ffa: 120, eba: 120 };

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

const datasetTypeLabels = {
  circle: "Natural Dataset",
  triangle: "Video Dataset (BMD)",
  diamond: "Synthetic / OOD",
};

export default function ScatterGapCeiling({
  murtyData,
  nsdData,
  ceilingData,
  roi,
  dataset,
  training,   
}) {
  const svgRef = useRef();

  useEffect(() => {
    if (!murtyData && !nsdData) return;

    // =====  training filter =====
    let entries = [];
    if (training === "Murty185") {
      entries = [
        ...Object.entries(murtyData || {}).map(([key, value]) => {
          const [ds, roiName] = key.split("/");
          return { Dataset: ds, ROI: roiName, Train: "Murty185", ...value };
        }),
      ];
    } else if (training === "NSD") {
      entries = [
        ...Object.entries(nsdData || {}).map(([key, value]) => {
          const [ds, roiName] = key.split("/");
          return { Dataset: ds, ROI: roiName, Train: "NSD1000", ...value };
        }),
      ];
    } else {
      entries = [
        ...Object.entries(murtyData || {}).map(([key, value]) => {
          const [ds, roiName] = key.split("/");
          return { Dataset: ds, ROI: roiName, Train: "Murty185", ...value };
        }),
        ...Object.entries(nsdData || {}).map(([key, value]) => {
          const [ds, roiName] = key.split("/");
          return { Dataset: ds, ROI: roiName, Train: "NSD1000", ...value };
        }),
      ];
    }


    let filtered;
    // if (dataset === "murty185" || dataset === "nsd_1000") {
    //   filtered = entries.filter(
    //     (d) =>
    //       d.Train.toLowerCase() === dataset.toLowerCase() &&
    //       (roi === "" || d.ROI === roi)
    //   );
    // } else {
      filtered = entries.filter(
        (d) =>
          (roi === "" || d.ROI === roi) &&
          (dataset === "" || d.Dataset === dataset)
      );
    // }

    const grouped = d3.rollups(
      filtered,
      (v) => ({
        ceiling_mean: d3.mean(v, (d) => d.ceiling_mean),
        normalized_gap: d3.mean(v, (d) => d.normalized_gap),
        sem: d3.mean(v, (d) => d.sem_normalized_model || 0),
        variance: d3.mean(v, (d) => d.std_normalized_model || 0),
        rawPoints: v,
      }),
      (d) => `${d.Dataset}/${d.ROI}`
    );

    const aggregated = grouped.map(([key, stats]) => {
      const [dataset, roi] = key.split("/");
      return { Dataset: dataset, ROI: roi, id: key, ...stats };
    });

    const margin = { top: 40, right: 20, bottom: 60, left: 80 };
    const width = 1080;
    const height = 800;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    svg.selectAll("*").remove();

    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([-0.4, 1.0]).range([0, plotWidth]);
    const y = d3.scaleLinear().domain([0, 1.0]).range([plotHeight, 0]);

    g.append("g")
      .attr("transform", `translate(0,${plotHeight})`)
      .call(d3.axisBottom(x).tickValues(d3.range(-0.4, 1.05, 0.1)))
      .attr("class", "axis");
    g.append("g").call(d3.axisLeft(y)).attr("class", "axis");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Dataset Ceiling: Mean Subject Pairwise Correlations ± Variability");
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Normalized Gap Between Model Performance and Dataset Ceiling");

    const hoverLayer = g.append("g").attr("class", "hover-layer");

    aggregated.forEach((row) => {
      const { Dataset, ROI, id } = row;
      if (
        row.ceiling_mean == null ||
        row.normalized_gap == null ||
        isNaN(row.ceiling_mean) ||
        isNaN(row.normalized_gap)
      )
        return;

      const cx = x(row.ceiling_mean);
      const cy = y(row.normalized_gap);

      const color = roiColors[ROI] || "gray";
      const size = roiSize[ROI] || 100;

      const shapeFn = datasetShapes[Dataset] || d3.symbolCircle;
      const shape = d3.symbol().type(shapeFn).size(size)();

      // ceiling range
      if (ceilingData?.[ROI]?.[Dataset]?.correlation_points) {
        const rawVals = ceilingData[ROI][Dataset].correlation_points;
        if (rawVals.length > 0) {
          const rawMin = d3.min(rawVals);
          const rawMax = d3.max(rawVals);
          g.append("line")
            .attr("class", "agg-item")
            .attr("data-id", id)
            .attr("x1", x(rawMin))
            .attr("x2", x(rawMax))
            .attr("y1", cy)
            .attr("y2", cy)
            .attr("stroke", color)
            .attr("stroke-width", 6)
            .attr("opacity", 0.3);
        }
      }

      const mainDot = g
        .append("path")
        .attr("class", "agg-item")
        .attr("data-id", id)
        .attr("d", shape)
        .attr("transform", `translate(${cx},${cy})`)
        .attr("fill", color)
        .attr("stroke", "black")
        .attr("stroke-width", 1);

      if (Math.abs(row.normalized_gap) > 0.2 || (row.variance ?? 0) > 0.05) {
        g.append("text")
          .attr("class", "agg-item")
          .attr("data-id", id)
          .attr("x", cx + 5)
          .attr("y", cy)
          .attr("font-size", 9)
          .attr("fill", "black")
          .text(`${datasetLabelMap[Dataset]}/${ROI.toUpperCase()}:${row.normalized_gap.toFixed(2)}`);
      }
      mainDot
      .on("mouseover", () => {
        g.selectAll(".agg-item").attr("display", "none");

        g.selectAll(`.agg-item[data-id='${id}']`).attr("display", null);


        mainDot.transition().duration(200).attr("opacity", 0.3);

        hoverLayer.selectAll("*").remove();

        if (row.rawPoints?.length > 0) {
          const sortedPoints = [...row.rawPoints].sort(
            (a, b) => a.normalized_gap - b.normalized_gap
          );

          sortedPoints.forEach((pt, i) => {
            const px = x(pt.ceiling_mean);
            const py = y(pt.normalized_gap);
            const subShape = d3.symbol().type(shapeFn).size(80)();

            // animation
            hoverLayer
              .append("path")
              .attr("d", subShape)
              .attr("transform", `translate(${px},${py})`)
              .attr("fill", color)
              .attr("stroke", "black")
              .attr("opacity", 0)
              .transition()
              .duration(300)
              .attr("opacity", 1);

            const labelY = i === 0 ? py + 15 : py - 11;
            hoverLayer
              .append("text")
              .attr("x", px)
              .attr("y", labelY)
              .attr("text-anchor", "middle")
              .attr("font-size", 10)
              .attr("fill", "black")
              .attr("opacity", 0)
              .text(`Trained on ${pt.Train}: ${pt.normalized_gap.toFixed(2)}`)
              .transition()
              .duration(300)
              .attr("opacity", 1);
          });
        }
      })
      .on("mouseout", () => {
        
        mainDot.transition().duration(200).attr("opacity", 1);
        g.selectAll(".agg-item").attr("display", null);
        hoverLayer.selectAll("*").remove();
      });

  
    });

    const roiLegend = svg
      .append("g")
      .attr("transform", `translate(${width - plotWidth + 20},${margin.top + 150})`);
    Object.entries(roiColors)
      .filter(([roiKey]) => roi === "" || roiKey === roi)
      .forEach(([roiKey, color], i) => {
        roiLegend
          .append("text")
          .attr("x", 15)
          .attr("y", i * 28 + 4)
          .attr("font-size", 24)
          .attr("fill", color)
          .text(roiKey.toUpperCase());
      });

    const shapeLegend = svg
      .append("g")
      .attr("transform", `translate(${width - plotWidth + 20},${margin.top + 40})`);
    Object.entries(datasetTypeLabels).forEach(([shapeName, label], i) => {
      const shapeFn =
        shapeName === "circle"
          ? d3.symbolCircle
          : shapeName === "triangle"
          ? d3.symbolTriangle
          : d3.symbolDiamond;
      const path = d3.symbol().type(shapeFn).size(120)();
      shapeLegend
        .append("path")
        .attr("d", path)
        .attr("transform", `translate(0,${i * 24 - 2})`)
        .attr("fill", "white")
        .attr("stroke", "black");
      shapeLegend
        .append("text")
        .attr("x", 15)
        .attr("y", i * 24 + 4)
        .attr("font-size", 20)
        .text(label);
    });
  }, [murtyData, nsdData, ceilingData, roi, dataset,training]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}
