'use client'
// hooks/useLoadData.js
import { useEffect, useState } from 'react';
import * as d3 from 'd3';

export default function useLoadData() {
  const [data, setData] = useState({ Murty185: {}, NSD: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let murty = {};
    let nsd = {};

    let murtyLoaded = false;
    let nsdLoaded = false;

    function averageByModelROI(data) {
      const grouped = d3.rollup(
        data,
        v => d3.mean(v, d => d.pearsonr),
        d => d.model,
        d => d.dataset,
        d => d.roi
      );

      return Array.from(grouped, ([model, datasetMap]) =>
        Array.from(datasetMap, ([dataset, roiMap]) =>
          Array.from(roiMap, ([roi, pearsonr]) => ({
            model,
            dataset,
            roi,
            pearsonr,
          }))
        )
      ).flat(2);
    }

    function maybeFinish() {
      if (murtyLoaded && nsdLoaded) {
        setData({ Murty185: murty, NSD: nsd });
        setLoading(false);
      }
    }

    d3.json('assets/data/data_scoreboard_test/trained_on_Murty185.json').then(data => {
      if (!data || data.length === 0) {
        console.error('❌ Murty185 data is empty');
        return;
      }
      murty.overallData = data.filter(d => d.roi === 'Overall');
      murty.ppaData = averageByModelROI(data.filter(d => d.roi === 'PPA'));
      murty.ffaData = averageByModelROI(data.filter(d => d.roi === 'FFA'));
      murty.ebaData = averageByModelROI(data.filter(d => d.roi === 'EBA'));
      murty.allData = averageByModelROI(data.filter(d => d.roi !== 'Overall'));
      murty.unfilter = averageByModelROI(data);
      murtyLoaded = true;
      maybeFinish();
    });

    d3.json('assets/data/data_scoreboard_test/trained_on_NSD.json').then(data => {
      if (!data || data.length === 0) {
        console.error('❌ NSD data is empty');
        return;
      }
      nsd.overallData = data.filter(d => d.roi === 'Overall');
      nsd.ppaData = averageByModelROI(data.filter(d => d.roi === 'PPA'));
      nsd.ffaData = averageByModelROI(data.filter(d => d.roi === 'FFA'));
      nsd.ebaData = averageByModelROI(data.filter(d => d.roi === 'EBA'));
      nsd.allData = averageByModelROI(data.filter(d => d.roi !== 'Overall'));
      nsd.unfilter = averageByModelROI(data);
      nsdLoaded = true;
      maybeFinish();
    });
  }, []);

  return { data, loading };
}
