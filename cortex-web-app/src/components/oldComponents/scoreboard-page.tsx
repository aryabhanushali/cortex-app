'use client'
import React, { useState, useEffect } from 'react';

import ROISelect from './roiselect.jsx';
import TrainingSelect from './trainingselect.jsx';
import DatasetSelect from './datasetselect.jsx';
import HeatChartOverall from './overallheatchart.jsx';
import useLoadData from './loaddata.jsx';
import RoiHeatChart from './roiheartchart.jsx';
import BarChartSpecific from './barchartspecific.jsx';

const ScoreboardPage: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const { data, loading } = useLoadData();
  
  const [manualStepChange, setManualStepChange] = useState(false);

  const DEFAULT_TRAINING = "Murty185"
  const DEFAULT_DATASET_EMPTY= ""   
  const DEFAULT_REGION = "Overall";
  const DEFAULT_DATASET = "Murty185";
  const DEFAULT_REGION_EMPTY = "";
  
  const [datasetEmpty, setDatasetEmpty] = useState(DEFAULT_DATASET_EMPTY);
  const [dataset, setDataset] = useState(DEFAULT_DATASET);
  const [training, setTraining] = useState(DEFAULT_TRAINING);
  const [regionEmpty, setRegionEmpty] = useState(DEFAULT_REGION_EMPTY);
  const [region, setRegion] = useState(DEFAULT_REGION);

  const roiDataMap = {
    PPA: (data as any)[training]?.ppaData,
    FFA: (data as any)[training]?.ffaData,
    EBA: (data as any)[training]?.ebaData,
    FBA: (data as any)[training]?.fbaData,
    OFA: (data as any)[training]?.ofaData,
    OPA: (data as any)[training]?.opaData,
    RSC: (data as any)[training]?.rscData,
    VWFA: (data as any)[training]?.vwfaData,
  };
  
  type DataItem = {
    model: string;
    dataset: string;
    roi: string;
    pearsonr: number;
  };

  const roiData = (roiDataMap as any)[region] || [];
  const filtereROIData: DataItem[] = roiData.filter((d: DataItem) => d.dataset === datasetEmpty);

  const overallData=(data as any)[training]?.overallData || [];
  const filteredOverallData: DataItem[] = overallData.filter((d: DataItem) => d.dataset === datasetEmpty);
  
  const unfilteredData: DataItem[] = (data as any)[training]?.unfilter || [];
  const filteredData = unfilteredData.filter(d => {
    if (current === 0 || current === 1) {
      return d.dataset === datasetEmpty;
    } else {
      return d.dataset === dataset;
    }
  });
  const filteredRegionData : DataItem[] = filteredData.filter((d: DataItem) => d.roi === regionEmpty);
  
  console.log('🎯 OverallData:', (data as any)[training]?.overallData);
  console.log('🎯 filteredData:', filteredData);
  console.log('🎯 filteredOverallData:', filteredOverallData);

  const contentStyle: React.CSSProperties = {
    marginTop: '20px'
  };

  useEffect(() => {
    if (!manualStepChange) {
      if (current === 0 && region !== "Overall") {
        setCurrent(1);
      } else if (current === 1 && region === "Overall" && datasetEmpty === "") {
        setCurrent(0);
      }
    }
  }, [region, datasetEmpty, current]);
  
  useEffect(() => {
    if (manualStepChange) {
      setManualStepChange(false); 
    }
  }, [manualStepChange]);
  
  const steps = [
    {
      title: 'Overall performance across all regions',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <TrainingSelect training={training} setTraining={setTraining} dataset={dataset}/>
          <DatasetSelect dataset={datasetEmpty} setDataset={setDatasetEmpty} training={training} allowToggle={true}/>
          <ROISelect region={region} setRegion={setRegion} dataset={dataset} allowToggle={false}/>
          {!loading && overallData.length > 0 && datasetEmpty === "" && (
            <HeatChartOverall dataset={overallData} title="Cross-Regions Performance on all Datasets" />
          )}

          {!loading && filteredOverallData.length > 0 && (
            <BarChartSpecific dataset={filteredOverallData} title={`Cross-Regions Performance on ${datasetEmpty}`} />
          )}
        </div>
      ),
      icon: 'bi-emoji-smile',
    },
    {
      title: 'A specific ROI',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <TrainingSelect training={training} setTraining={setTraining} dataset={dataset}/>
          <DatasetSelect dataset={datasetEmpty} setDataset={setDatasetEmpty} training={training} allowToggle={true}/>
          <ROISelect region={region} setRegion={setRegion} dataset={dataset} allowToggle={false}/>
          {!loading && roiData.length > 0 && datasetEmpty === "" && (
            <HeatChartOverall dataset={roiData} title={`${region} Performance on all Datasets`} />
          )}
          {!loading && filtereROIData.length > 0 && (
            <BarChartSpecific dataset={filtereROIData} title={`${region} Performance on ${datasetEmpty}`} />
          )}
        </div>
      ),
      icon: 'bi-graph-up',
    },
    {
      title: 'A specific Dataset',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <TrainingSelect training={training} setTraining={setTraining} dataset={dataset}/>
          <DatasetSelect dataset={dataset} setDataset={setDataset} training={training} allowToggle={false}/>
          <ROISelect region={regionEmpty} setRegion={setRegionEmpty} dataset={dataset} allowToggle={true} />
          {!loading &&  filteredData.length > 0 && regionEmpty === "" &&(
            <RoiHeatChart dataset={filteredData} title={`Models Performance on Evaluation Datasets: ${dataset}`}/>
          )}
          {!loading && filteredRegionData.length > 0 && (
            <BarChartSpecific dataset={filteredRegionData} title={`${regionEmpty} Performance on ${dataset}`} />
          )}
        </div>
      ),
      icon: 'bi-database',
    },
  ];

  return (
    <>
      <ul className="nav nav-pills nav-justified mb-4">
        {steps.map((item, index) => (
          <li className="nav-item" key={item.title}>
            <button 
              className={`nav-link ${current === index ? 'active' : ''}`}
              onClick={() => {
                setManualStepChange(true); 
                setCurrent(index);
                if (index === 0) {
                  setRegion("Overall");
                  setDatasetEmpty("");
                  setTraining("Murty185");
                } else if (index === 1) {
                  setRegion("PPA");
                  setDatasetEmpty("");
                  setTraining("Murty185");
                } else if(index === 2) {
                  setRegionEmpty("");
                  setDataset("Murty185");
                  setTraining("Murty185");
                }
              }}
            >
              <i className={`bi ${item.icon} me-2`}></i>
              {item.title}
            </button>
          </li>
        ))}
      </ul>

      <div style={contentStyle}>
        {steps[current].content}
      </div>
    </>
  );
};

export default ScoreboardPage;
