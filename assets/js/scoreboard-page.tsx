import React, { useState, useEffect } from 'react';
import { Button, message, Steps, theme } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

import ROISelect from './roiselect.jsx';
import TrainingSelect from './trainingselect.jsx';
import DatasetSelect from './datasetselect.jsx';
import HeatChartOverall from './overallheatchart.jsx';
import useLoadData from './loaddata.jsx';








const ScoreboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const { data, loading } = useLoadData();
  
 

  const DEFAULT_OVERALL = "overall"
  const DEFAULT_TRAINING = "Murty185"

  const DEFAULT_DATASET_EMPTY= ""
  
  const DEFAULT_ROI = "ffa";
  
  const DEFAULT_DATASET = "NSD";
  


  const [datasetEmpty, setDatasetEmpty] = useState(DEFAULT_DATASET_EMPTY);
  const [dataset, setDataset] = useState(DEFAULT_DATASET);
  const [overall, setOverall] = useState(DEFAULT_OVERALL);
  const [training, setTraining] = useState(DEFAULT_TRAINING);
  const [roi, setROI] = useState(DEFAULT_ROI);

  const overallData =(data as any)[training]?.overallData || [];
 
  console.log('🎯 OverallData:', (data as any)[training]?.overallData);
//   console.log('📊 Unique datasets in overallData:', [...new Set(((data as any)[training]?.overallData || []).map(d => d.dataset))]);
  

  const contentStyle: React.CSSProperties = {
    lineHeight: '260px',
    textAlign: 'center',
    color: token.colorTextTertiary,
    backgroundColor: 'transparent',
    borderRadius: 0,
    border: 'none',
    marginTop: 16,
  };

  

  const steps = [
    {
      title: 'Overall performance across all regions',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <TrainingSelect training={training} setTraining={setTraining} dataset={dataset}/>
          <DatasetSelect dataset={datasetEmpty} setDataset={setDatasetEmpty} training={training}/>
          <ROISelect region={overall} setRegion={setOverall} dataset={dataset}/>
          {!loading && (
            <HeatChartOverall dataset={overallData} title="Cross-Regions Performance on all Datasets" />
          )}

          {/* <div className="overallchart">
            <div id="cross-regions-performance-all-datasets"></div>
          </div> */}
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
          <ROISelect region={roi} setRegion={setROI} dataset={dataset}/>
          
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
          <ROISelect region={roi} setRegion={setROI} dataset={dataset} />
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
            onClick={() => setCurrent(index)}
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
