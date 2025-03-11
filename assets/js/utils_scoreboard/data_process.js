function loadData(callback) {
    d3.json("assets/data/data_scoreboard_test/plot_frame.json").then(data => {
        console.log("Data Loaded:", data);
        if (!data || data.length === 0) {
            console.error("❌ JSON data is empty");
            return;
        }

        
        function averageByModelROI(data) {
            let grouped = d3.rollup(
                data, 
                v => d3.mean(v, d => d.pearsonr),  // 计算 pearsonr 均值
                d => d.model,  
                d => d.dataset, 
                d => d.roi
            );
        
            console.log("Grouped Data:", grouped); // 调试分组后的数据
        
            let flattened = Array.from(grouped, ([model, datasetMap]) => 
                Array.from(datasetMap, ([dataset, roiMap]) => 
                    Array.from(roiMap, ([roi, pearsonr]) => ({
                        model,
                        dataset,
                        roi,  // 确保 roi 信息被保留
                        pearsonr
                    }))
                )
            ).flat(2);
        
            console.log("Flattened Data:", flattened); // 调试最终展开的数据
        
            return flattened;
        }
        

        const overallData = data.filter(d => d.roi === "Overall");
        const ppaData = averageByModelROI(data.filter(d => d.roi === "PPA"));
        const ffaData = averageByModelROI(data.filter(d => d.roi === "FFA"));
        const ebaData = averageByModelROI(data.filter(d => d.roi === "EBA"));

       
        callback(overallData, ppaData, ffaData, ebaData);

    }).catch(error => console.error("❌ Data loading failed:", error));
}

window.loadData = loadData;