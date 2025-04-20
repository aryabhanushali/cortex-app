function drawChart(selector, dataset, title) {

   

    const svg = d3.select(selector)
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height);

    const xScale = d3.scaleLinear()
                     .domain([-0.3, 1.5])
                     .range([margin.left, width - margin.right]);

    const yScale = d3.scaleBand()
                     .domain(dataset.map(d => d.model))
                     .range([margin.top, height - margin.bottom])
                     .padding(0.2);

    svg.append("g")
       .attr("transform", `translate(0, ${height - margin.bottom})`)
       .call(d3.axisBottom(xScale));

    svg.append("g")
       .attr("transform", `translate(${margin.left}, 0)`)
       .call(d3.axisLeft(yScale))
       .selectAll("text")
       .attr("class", "axis-label");

    svg.selectAll(".background-bar")
       .data(dataset)
       .enter()
       .append("rect")
       .attr("class", "background-bar")
       .attr("x", xScale(-0.3))
       .attr("y", d => yScale(d.model) + yScale.bandwidth() * 0.25)
       .attr("width", d => xScale(d.pearsonr) - xScale(-0.3))
       .attr("height", 0.4 * yScale.bandwidth())
       .attr("fill", "#ddd");

    svg.selectAll(".error-bar")
        .data(dataset)
        .enter()
        .append("line")
        .attr("class", "error-bar")
        .attr("x1", d => xScale(d.pearsonr - 0.1))
        .attr("x2", d => xScale(d.pearsonr + 0.1))
        .attr("y1", d => yScale(d.model) + yScale.bandwidth() / 2)
        .attr("y2", d => yScale(d.model) + yScale.bandwidth() / 2)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    svg.selectAll(".dot")
       .data(dataset)
       .enter()
       .append("circle")
       .attr("class", "dot")
       .attr("cx", d => xScale(d.pearsonr))
       .attr("cy", d => yScale(d.model) + yScale.bandwidth() / 2)
       .attr("r", 5)
       .attr("fill", "steelblue");

    svg.append("text")
       .attr("x", width / 2)
       .attr("y", 30)
       .attr("class", "model-label")
       .attr("text-anchor", "middle")
       .text(title);
}


function drawChartOverall(selector, dataset, title) {

   const baseFontSize = Math.min(width, height) * 0.02;  
    
   const svg = d3.select(selector)
                 .append("svg")
                 .attr("width", width)
                 .attr("height", height);

   const models = Array.from(new Set(dataset.map(d => d.model)));
   //const datasets = ["NSD", "dataset1", "dataset2", "dataset3"];
   const datasets = Array.from(new Set(dataset.map(d => d.dataset)));



   const xScale = d3.scaleBand()
                    .domain(datasets)
                    .range([margin.left, width - margin.right])
                    .padding(0.05);


   const yScale = d3.scaleBand()
                    .domain(models)
                    .range([margin.top, height - margin.bottom])
                    .padding(0.05);

  
   // const colorScale = d3.scaleLinear()
   //                      .domain([-0.3, 1.0])
   //                      .range(["#deebf1", "#3182bd"]);  // 浅蓝到深蓝
   const colorScale = d3.scaleSequential()
                        .domain([-0.3, 0.8])
                        .interpolator(d3.interpolateBlues);

   const xAxis = svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

 
   xAxis.selectAll("text")
      .attr("class", "axis-label clickable") 
      .style("cursor", "pointer")  // 🆕 鼠标指针变成手型
      .style("font-size", `${baseFontSize * 1.5}px`)
      

   
   const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
      
   yAxis.selectAll("text")
      .attr("class", "axis-label clickable")
      .style("cursor", "pointer")
      .style("font-size", `${baseFontSize * 1.5}px`);
      


   const cells = svg.selectAll(".heatmap-cell")
                    .data(dataset)
                    .enter()
                    .append("g")
                    .attr("class", "heatmap-cell")
                    .attr("transform", d => `translate(${xScale(d.dataset)}, ${yScale(d.model)})`);

   cells.append("rect")
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.pearsonr));


   cells.append("text")
        .attr("x", xScale.bandwidth() / 2)
        .attr("y", yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("fill", "white")  // 白色文字
        .style("font-size", `${baseFontSize * 1.5}px`)

        .text(d => d.pearsonr.toFixed(2));


   svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("class", "model-label")
      .attr("text-anchor", "middle")
      .style("font-size", `${baseFontSize * 1.5}px`)
      .text(title);
}


function drawChartRoi(selector, dataset, title) {

   const baseFontSize = Math.min(width, height) * 0.02;  
    
   const svg = d3.select(selector)
                 .append("svg")
                 .attr("width", width)
                 .attr("height", height);

   const models = Array.from(new Set(dataset.map(d => d.model)));
   //const datasets = ["NSD", "dataset1", "dataset2", "dataset3"];
    const rois = ["Overall", "PPA", "FFA", "EBA"];
   // const rois = Array.from(new Set(dataset.map(d => d.roi)));



   const xScale = d3.scaleBand()
                    .domain(rois)
                    .range([margin.left, width - margin.right])
                    .padding(0.05);


   const yScale = d3.scaleBand()
                    .domain(models)
                    .range([margin.top, height - margin.bottom])
                    .padding(0.05);

  
   // const colorScale = d3.scaleLinear()
   //                      .domain([-0.1, 0.8])
   //                      // .range(["#ffffff", "#3182bd"]);  // 浅蓝到深蓝
                        //.interpolate(d3.interpolateBlues);

   const colorScale = d3.scaleSequential()
                        .domain([-0.3, 0.8])
                        .interpolator(d3.interpolateBlues);

   const xAxis = svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

 
   xAxis.selectAll("text")
      .attr("class", "axis-label clickable") 
      .style("cursor", "pointer")  // 🆕 鼠标指针变成手型
      .style("font-size", `${baseFontSize * 1.5}px`)
      .on("click", function(event, datasetName) {
         if (selectedRegion === "overall") {
            window.location.href = `cross-region-performance-page.html?dataset=${datasetName}`;
         } else {
            window.location.href = `roi-performance-page.html?dataset=${datasetName}&roi=${selectedRegion}`;
         }
      });

   
   const yAxis = svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale))
      
   yAxis.selectAll("text")
      .attr("class", "axis-label clickable")
      .style("cursor", "pointer")
      .style("font-size", `${baseFontSize * 1.5}px`);
      


   const cells = svg.selectAll(".heatmap-cell")
                    .data(dataset)
                    .enter()
                    .append("g")
                    .attr("class", "heatmap-cell")
                    .attr("transform", d => `translate(${xScale(d.roi)}, ${yScale(d.model)})`);

   cells.append("rect")
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.pearsonr));


   cells.append("text")
        .attr("x", xScale.bandwidth() / 2)
        .attr("y", yScale.bandwidth() / 2)
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .attr("fill", "white")  // 白色文字
        .style("font-size", `${baseFontSize * 1.5}px`)

        .text(d => d.pearsonr.toFixed(2));


   svg.append("text")
      .attr("x", width / 2)
      .attr("y", 20)
      .attr("class", "model-label")
      .attr("text-anchor", "middle")
      .style("font-size", `${baseFontSize * 1.5}px`)
      .text(title);
}


// function drawChartOverall(selector, dataset, title) {
//    const baseFontSize = Math.min(width, height) * 0.02;  

   

//    const svg = d3.select(selector)
//                 .append("svg")
//                 .attr("width", width)
//                 .attr("height", height);

//    // **提取所有的 `model` 和 `dataset` 维度**
//    const models = Array.from(new Set(dataset.map(d => d.model)));  
//    const datasets = ["NSD", "dataset1", "dataset2", "dataset3"];
//    // const datasets = Array.from(new Set(dataset.map(d => d.dataset))); 

//    // **定义 `x 轴`（dataset）和 `y 轴`（model）**
//    const xScale = d3.scaleBand()
//                     .domain(datasets)
//                     .range([margin.left, width - margin.right])
//                     .padding(0.05);

//    const yScale = d3.scaleBand()
//                     .domain(models)
//                     .range([margin.top, height - margin.bottom])
//                     .padding(0.05);

//    // **计算 pearsonr 最大最小值，以适配颜色**
//    const minPearson = d3.min(dataset, d => d.pearsonr);
//    const maxPearson = d3.max(dataset, d => d.pearsonr);
//    const colorScale = d3.scaleLinear()
//                         .domain([minPearson, maxPearson])
//                         .range(["#deebf7", "#3182bd"]);  // 颜色从浅蓝到深蓝

//    // **X 轴**
//    const xAxis = svg.append("g")
//                     .attr("transform", `translate(0, ${height - margin.bottom})`)
//                     .call(d3.axisBottom(xScale));

//    xAxis.selectAll("text")
//         .attr("class", "axis-label")
//         .style("cursor", "pointer")
//         .style("font-size", `${baseFontSize * 1.5}px`)
//         .on("click", function(event, datasetName) {
//                   if (selectedRegion === "overall") {
//                      window.location.href = `cross_region_performance.html?dataset=${datasetName}`;
//                   } else {
//                      window.location.href = `roi_performance.html?dataset=${datasetName}&region=${selectedRegion}`;
//                   }
//                });

//    // **Y 轴**
//    const yAxis = svg.append("g")
//                     .attr("transform", `translate(${margin.left}, 0)`)
//                     .call(d3.axisLeft(yScale));

//    yAxis.selectAll("text")
//         .attr("class", "axis-label")
//         .style("font-size", `${baseFontSize * 1.5}px`);

//    // **绘制 Heatmap**
//    const cells = svg.selectAll(".heatmap-cell")
//                     .data(dataset)
//                     .enter()
//                     .append("g")
//                     .attr("class", "heatmap-cell")
//                     .attr("transform", d => `translate(${xScale(d.dataset)}, ${yScale(d.model)})`);

//    // **添加矩形方格**
//    cells.append("rect")
//         .attr("width", xScale.bandwidth())
//         .attr("height", yScale.bandwidth())
//         .attr("fill", d => colorScale(d.pearsonr));
      

//    // **添加数值文本**
//    cells.append("text")
//         .attr("x", xScale.bandwidth() / 2)
//         .attr("y", yScale.bandwidth() / 2)
//         .attr("dy", ".35em")
//         .attr("text-anchor", "middle")
//         .attr("fill", "white")
//         .style("font-size", `${baseFontSize * 1.2}px`)
//         .text(d => d.pearsonr.toFixed(2));

//    // **标题**
//    svg.append("text")
//       .attr("x", width / 2)
//       .attr("y", 20)
//       .attr("class", "model-label")
//       .attr("text-anchor", "middle")
//       .style("font-size", `${baseFontSize * 1.5}px`)
//       .text(title);
// }

