// components/HeatmapByROI.jsx
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const HeatmapDetail = ({ data, roi, dataset, rank, onModelClick  }) => {
  const headerRef = useRef();
  const bodyRef = useRef();
  const legendRef = useRef();

  const [selectedModel, setSelectedModel] = useState(null);

  const datasetLabelMap = {
  murty185: "Murty185",
  nsd_1000: "NSD1000",
  bold_5000: "BOLD5000v2",
  bonner_2021: "Bonner2021",
  bmd_2024: "BMD2024",
  kingbaker_2019: "King2019",
  wardle_2020: "Wardle2020",
  nsd_syn: "NSD synthetic",
  global_score: "Global Score" // special
};
  useEffect(() => {
    setSelectedModel(null);
    if (onModelClick) onModelClick(null); 
  }, [data, roi, dataset]);

  useEffect(() => {
    if (!data) return;


    d3.select(headerRef.current).select("svg").remove();
    d3.select(bodyRef.current).select("svg").remove();
    d3.select(legendRef.current).select("svg").remove();

    const headerMargin = { top: 80, right: 40, bottom: 10, left: 210};
    const bodyMargin = { top: 0, right: 40, bottom: 0, left: 210 };
    const rowHeight = 25;
    const rowGap = 2;
    const columnWidth = 75;
    const columnGap = 5;

    // color legend
    const colorScale = d3.scaleLinear().domain([0, 1]).range(["#D3D3D3", "#9CC9FF"]);

    let xLabels = [];
    let models = [];
    let cellData = [];
    let ceilingData = [];

    if (roi) {
      // case 1: fixed ROI
      models = Object.keys(data[roi] || {}).filter((m) => m !== "ceiling");
      xLabels = Array.from(new Set(models.flatMap((m) => Object.keys(data[roi][m] || {}))));

      models.forEach((model) => {
        let rawVals = [];
        xLabels.forEach((ds) => {
          if (["murty185", "nsd_1000"].includes(ds)) return; 
          const vals = data[roi][model]?.[ds];
          if (vals) {
            const raw = vals[0];
            const norm = vals[1];
            rawVals.push(raw);
            cellData.push({ model, x: ds, raw, norm });
          }
        });
        if (rawVals.length > 0) {
          cellData.push({
            model,
            x: "global_score",
            raw: d3.mean(rawVals),
            norm: null,
          });
        }
      });

      ceilingData = xLabels
        .filter(ds => !["murty185", "nsd_1000"].includes(ds)) 
        .map((ds) => {
          const vals = data[roi]?.ceiling?.[ds];
          return vals ? { x: ds, raw: vals[0], norm: vals[1] } : {};
        });

      const ceilingVals = ceilingData.map((d) => d.raw).filter((v) => v != null);
      if (ceilingVals.length > 0) {
        ceilingData.push({
          x: "global_score",
          raw: d3.mean(ceilingVals),
          norm: null,
        });
      }

      xLabels = ["global_score", ...xLabels.filter(ds => !["murty185", "nsd_1000"].includes(ds))];
    } else if (dataset) {
      // case 2: fixed Dataset
      const rois = Object.keys(data).filter((roiName) => roiName.toLowerCase() !== "overall");
      models = [];
      let validRois = [];

      rois.forEach((roiName) => {
        const modelNames = Object.keys(data[roiName] || {}).filter((m) => m !== "ceiling");
        models = Array.from(new Set([...models, ...modelNames]));

        let roiHasData = false;

        modelNames.forEach((model) => {
          const vals = data[roiName]?.[model]?.[dataset];
          if (vals) {
            roiHasData = true;
            cellData.push({ model, x: roiName, raw: vals[0], norm: vals[1] });
          }
        });

        const ceilingVals = data[roiName]?.ceiling?.[dataset];
        if (ceilingVals) {
          roiHasData = true;
          ceilingData.push({
            x: roiName,
            raw: ceilingVals[0],
            norm: ceilingVals[1],
          });
        }

        if (roiHasData) {
          validRois.push(roiName);
        }
      });

      models.forEach((model) => {
        const rawVals = cellData
          .filter((d) => d.model === model && d.raw != null)
          .map((d) => d.raw);
        if (rawVals.length > 0) {
          cellData.push({
            model,
            x: "global_score",
            raw: d3.mean(rawVals),
            norm: null,
          });
        }
      });

      const ceilingVals = ceilingData.map((d) => d.raw).filter((v) => v != null);
      if (ceilingVals.length > 0) {
        ceilingData.push({
          x: "global_score",
          raw: d3.mean(ceilingVals),
          norm: null,
        });
      }

      xLabels = ["global_score", ...validRois];
    } else {
      return;
    }

    //ranking logic
    if (rank && rank !== "") {
      const modelGlobal = {};
      cellData.forEach((d) => {
        if (d.x === "global_score") {
          modelGlobal[d.model] = d.raw ?? -Infinity;
        }
      });

      models.sort((a, b) => (modelGlobal[b] || -Infinity) - (modelGlobal[a] || -Infinity));
    }

    // ======= dimensions =======
    const chartWidth = xLabels.length * (columnWidth + columnGap);
    const headerHeight = headerMargin.top + rowHeight;
    const bodyHeight = models.length * (rowHeight + rowGap) + 50;
    const width = chartWidth + headerMargin.left + headerMargin.right;

    // ======= Header =======
    
    const svgHeader = d3
      .select(headerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", headerHeight);

    // top x axis
    svgHeader
      .append("g")
      .attr("transform", `translate(${columnWidth / 2},${headerMargin.top - 40})`)
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
        g.selectAll("text").style("font-size", "12px").style("fill", "black");
      })
      .selectAll("text")
      .text((d) => datasetLabelMap[d] || d)  
      .attr("transform", "rotate(-30)")
      .style("text-anchor", "end");

    // ceiling row
    svgHeader
      .selectAll("rect.ceiling")
      .data(ceilingData)
      .enter()
      .append("rect")
      .attr("class", "ceiling")
      .attr("x", (d) => headerMargin.left + xLabels.indexOf(d.x) * (columnWidth + columnGap))
      .attr("y", headerMargin.top)
      .attr("width", columnWidth)
      .attr("height", rowHeight)
      .attr("fill", (d) => {
        if (d.x === "global_score") return "rgba(158, 117, 214, 0.5)";
        if (d.norm == null) return "#f0f0f0";
        if (d.norm < 0) return colorScale(0);
        if (d.norm > 1) return colorScale(1);
        return colorScale(d.norm);
      });

    // ceiling label (raw)
    svgHeader
      .selectAll("text.ceiling-label")
      .data(ceilingData.filter((d) => d.raw != null))
      .enter()
      .append("text")
      .attr("class", "ceiling-label")
      .attr("x", (d) =>
        headerMargin.left +
        xLabels.indexOf(d.x) * (columnWidth + columnGap) +
        columnWidth / 2
      )
      .attr("y", headerMargin.top + rowHeight / 2)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("fill", "black")
      .style("font-size", "12px")
      .text((d) => d.raw.toFixed(2));

    // ceiling Y axis label
    svgHeader
      .append("g")
      .attr("transform", `translate(${headerMargin.left - 10},0)`)
      .call(
        d3
          .axisLeft(
            d3.scalePoint().domain(["ceiling"]).range([headerMargin.top + rowHeight / 2, headerMargin.top + rowHeight / 2])
          )
      )
      .call((g) => {
        g.select(".domain").remove();
        // g.selectAll("line").remove();
        g.selectAll("text").style("font-size", "12px").style("fill", "black");
      });

    // ======= Body =======
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
      .attr("x", (d) => bodyMargin.left + xLabels.indexOf(d.x) * (columnWidth + columnGap))
      .attr("y", (d) => bodyMargin.top + models.indexOf(d.model) * (rowHeight + rowGap))
      .attr("width", columnWidth)
      .attr("height", rowHeight)
      .attr("fill", (d) => {
        if (d.x === "global_score") return "rgba(158, 117, 214, 0.5)";
        if (d.norm == null) return "#f0f0f0";
        if (d.norm < 0) return colorScale(0);
        if (d.norm > 1) return colorScale(1);
        return colorScale(d.norm);
      });

    // cell label (raw)
    svgBody
      .selectAll("text.cell-label")
      .data(cellData.filter((d) => d.raw != null))
      .enter()
      .append("text")
      .attr("x", (d) =>
        bodyMargin.left +
        xLabels.indexOf(d.x) * (columnWidth + columnGap) +
        columnWidth / 2
      )
      .attr("y", (d) =>
        bodyMargin.top +
        models.indexOf(d.model) * (rowHeight + rowGap) +
        rowHeight / 2
      )
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .style("fill", "black")
      .style("font-size", "12px")
      .text((d) => d.raw.toFixed(2));

    // Y  (models)
    svgBody
      .append("g")
      .attr("transform", `translate(${bodyMargin.left - 10},0)`)
      .call(
        d3.axisLeft(
          d3.scalePoint().domain(models).range([
            bodyMargin.top + rowHeight / 2,
            bodyMargin.top + models.length * (rowHeight + rowGap) - rowGap - rowHeight / 2,
          ])
        )
      )
      .call((g) => {
        g.select(".domain").remove();
        g.selectAll("text")
          .style("font-size", "12px")
          .style("fill", "black")
          .style("font-weight", (d) => (d === selectedModel ? "bold" : "normal"))
          .style("cursor", "pointer")  
          .on("click", (event, d) => {
              const newSelection = (selectedModel === d ? null : d);  
              setSelectedModel(newSelection);
              if (onModelClick) {
                onModelClick(newSelection); 
              }
          });
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
  }, [data, roi, dataset, rank, onModelClick]);

  return (
    <div style={{ display: "flex", flexDirection: "row", justifyContent: "flex-start" }}>
      <div style={{ flex: 0, alignSelf: "flex-start" }}>
        <div ref={headerRef} style={{ lineHeight: "0", alignSelf: "flex-start" }}></div>
        <div ref={bodyRef} style={{ maxHeight: "400px",  overflowY: "scroll", marginTop: "10px"}}></div>
      </div>
      <div ref={legendRef} style={{ marginLeft: "0px", marginTop: "100px" }}></div>
    </div>
  );
  
};


export default HeatmapDetail;
