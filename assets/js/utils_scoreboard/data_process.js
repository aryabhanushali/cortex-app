function loadData(callback) {
    let murtyLoaded = false;
    let nsdLoaded = false;

    let murty = {};
    let nsd = {};

    function averageByModelROI(data) {
        let grouped = d3.rollup(
            data,
            v => d3.mean(v, d => d.pearsonr),
            d => d.model,
            d => d.dataset,
            d => d.roi
        );

        let flattened = Array.from(grouped, ([model, datasetMap]) =>
            Array.from(datasetMap, ([dataset, roiMap]) =>
                Array.from(roiMap, ([roi, pearsonr]) => ({
                    model,
                    dataset,
                    roi,
                    pearsonr
                }))
            )
        ).flat(2);

        return flattened;
    }

    // 加载 Murty185
    d3.json("assets/data/data_scoreboard_test/trained_on_Murty185.json").then(data => {
        if (!data || data.length === 0) {
            console.error("❌ Murty185 data is empty");
            return;
        }
        murty.overallData = data.filter(d => d.roi === "Overall");
        murty.ppaData = averageByModelROI(data.filter(d => d.roi === "PPA"));
        murty.ffaData = averageByModelROI(data.filter(d => d.roi === "FFA"));
        murty.ebaData = averageByModelROI(data.filter(d => d.roi === "EBA"));
        murty.allData = averageByModelROI(data.filter(d => d.roi !== "Overall"));
        murty.unfilter = averageByModelROI(data);
        murtyLoaded = true;
        maybeCallback();
    });

    // 加载 NSD
    d3.json("assets/data/data_scoreboard_test/trained_on_NSD.json").then(data => {
        if (!data || data.length === 0) {
            console.error("❌ NSD data is empty");
            return;
        }
        nsd.overallData = data.filter(d => d.roi === "Overall");
        nsd.ppaData = averageByModelROI(data.filter(d => d.roi === "PPA"));
        nsd.ffaData = averageByModelROI(data.filter(d => d.roi === "FFA"));
        nsd.ebaData = averageByModelROI(data.filter(d => d.roi === "EBA"));
        nsd.allData = averageByModelROI(data.filter(d => d.roi !== "Overall"));
        nsd.unfilter = averageByModelROI(data);
        nsdLoaded = true;
        maybeCallback();
    });

    function maybeCallback() {
        if (murtyLoaded && nsdLoaded) {
            callback({
                Murty185: murty,
                NSD: nsd
            });
        }
    }
}

window.loadData = loadData;
