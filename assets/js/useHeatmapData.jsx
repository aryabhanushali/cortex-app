import { useEffect, useState } from 'react';
import * as d3 from 'd3';

const useHeatmapData = () => {
  const [heatmapData, setHeatmapData] = useState(null);
  const [originalFilenames, setOriginalFilenames] = useState([]);
  const [sortedFilenames, setSortedFilenames] = useState([]);

  useEffect(() => {
    d3.json('/assets/data/heatmap_data.json')
      .then((data) => {
        const { original_filenames, sorted_filenames, rdm_values } = data;

        setOriginalFilenames(original_filenames);
        setSortedFilenames(sorted_filenames);

        const processedData = rdm_values.map(d => ({
          x: d.x,
          y: d.y,
          value: +d.value, // Ensure numeric values
        }));

        console.log('Processed heatmap data:', processedData);

        setHeatmapData(processedData);
      })
      .catch((error) => {
        console.error('Error loading heatmap data:', error);
      });
  }, []);

  return { heatmapData, originalFilenames, sortedFilenames };
};

export default useHeatmapData;
