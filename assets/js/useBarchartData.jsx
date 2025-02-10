import { useEffect, useState } from 'react';
import * as d3 from 'd3';

const useBarchartData = () => {
  const [barchartData, setBarchartData] = useState([]);

  useEffect(() => {
    d3.json('/assets/data/barchart_data.json')
      .then((data) => {

        const processedData = data.map(d => ({
            filename: d.filename,
            mean: +d.mean,
            sem: +d.sem,
          }));
        
        console.log('Processed barchart data:', processedData);
        setBarchartData(processedData);
      })
      .catch((error) => {
        console.error('Error loading barchart data:', error);
      });
  }, []);

  return { barchartData};
};

export default useBarchartData;
