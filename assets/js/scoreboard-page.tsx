import React, { useState, useEffect } from 'react';
import { Button, message, Steps, theme } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

import ROISelect from './roiselect.jsx';
import TrainingSelect from './trainingselect.jsx';
import DatasetSelect from './datasetselect.jsx';
import HeatChartOverall from './overallheatchart.jsx';
import useLoadData from './loaddata.jsx';
import RoiHeatChart from './roiheartchart.jsx';








const ScoreboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const { data, loading } = useLoadData();
  
 
  const [manualStepChange, setManualStepChange] = useState(false);

  const DEFAULT_TRAINING = "Murty185"

  const DEFAULT_DATASET_EMPTY= ""   
  
  const DEFAULT_REGION = "overall";
  
  const DEFAULT_DATASET = "NSD";
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

  const roiData = (roiDataMap as any)[region] || [];

  const overallData =(data as any)[training]?.overallData || [];

  type DataItem = {
    model: string;
    dataset: string;
    roi: string;
    pearsonr: number;
  };
  
  const unfilteredData: DataItem[] = (data as any)[training]?.unfilter || [];
  const filteredData = unfilteredData.filter(d => d.dataset === dataset);
  

 
  console.log('🎯 OverallData:', (data as any)[training]?.overallData);
    

  const contentStyle: React.CSSProperties = {
    lineHeight: '260px',
    textAlign: 'center',
    color: token.colorTextTertiary,
    backgroundColor: 'transparent',
    borderRadius: 0,
    border: 'none',
    marginTop: 16,
  };

  useEffect(() => {
    if (!manualStepChange) {
      if (current === 0 && region !== "overall") {
        setCurrent(1);
      } else if (current === 1 && region === "overall" && datasetEmpty === "") {
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
          <DatasetSelect dataset={datasetEmpty} setDataset={setDatasetEmpty} training={training}/>
          <ROISelect region={region} setRegion={setRegion} dataset={dataset}/>
          {!loading && (
            <HeatChartOverall dataset={overallData} title="Cross-Regions Performance on all Datasets" />
          )}
        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title: 'A specific ROI',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <TrainingSelect training={training} setTraining={setTraining} dataset={dataset}/>
          <DatasetSelect dataset={datasetEmpty} setDataset={setDatasetEmpty} training={training}/>
          <ROISelect region={region} setRegion={setRegion} dataset={dataset}/>
          {!loading && (
            <HeatChartOverall dataset={roiData} title={`${region} Performance on all Datasets`} />
          )}
          
        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title: 'A specific Dataset',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <TrainingSelect training={training} setTraining={setTraining} dataset={dataset}/>
          <DatasetSelect dataset={dataset} setDataset={setDataset} training={training}/>
          <ROISelect region={regionEmpty} setRegion={setRegionEmpty} dataset={dataset} />
          {!loading && (
            <RoiHeatChart dataset={filteredData} title="Cross-Regions Performance on all Datasets" />
          )}
        </div>
      ),
      icon: <SmileOutlined />,
    },
  ];

  return (
    <>
    <Steps>
        {steps.map((item, index) => (
            <Steps.Step
            key={item.title}
            title={item.title}
            icon={item.icon}
            status={current === index ? 'process' : 'wait'}
            onClick={() => {
                setManualStepChange(true); // 用户点击触发
                setCurrent(index);
                if (index === 0) {
                    setRegion("overall");
                } else if (index === 1 && region === "overall") {
                    setRegion("PPA");
                }
                
                
            }
        }
            style={{ cursor: 'pointer' }}
            />
        ))}
    </Steps>

      <div style={contentStyle}>{steps[current].content}</div>

      {/* <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: "8px",marginBottom:24 }}>

        {current === 0 && (
          <Button
            type="primary"
            onClick={() => {
              message.success("Image Upload complete!");

              next();
            }}
            disabled={loading || files.length === 0}
          >
            {loading ? "Uploading..." : "Proceed to Settings"}
          </Button>
        )}

        {current === 1 && (
          <Button
            type="primary"
            onClick={() => {
              predictstep === 1 ? handlePrediction() : next();
            }}
            disabled={loading || files.length === 0}
          >
            {loading ? "Processing..." : "Check Prediction Results"}
          </Button>
        )}

        {current === steps.length - 1 && (
          <Button
            type="primary"
            onClick={downloadData}
            disabled={!predictionResult} // Disable if no prediction result
          >
            Download Data
          </Button>
        )}
      </div> */}
    </>
  );
};

export default ScoreboardPage;
