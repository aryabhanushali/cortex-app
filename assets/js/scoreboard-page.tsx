import React, { useState, useEffect } from 'react';
import { Button, message, Steps, theme } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

import ROISelect from './roiselect.jsx';
import TrainingSelect from './trainingselect.jsx';
import DatasetSelect from './datasetselect.jsx';
import HeatChartOverall from './overallheatchart.jsx';
import useLoadData from './loaddata.jsx';
import useLoadDataNew from './loadDataNew.jsx';
import RoiHeatChart from './roiheartchart.jsx';
import BarChartSpecific from './barchartspecific.jsx';

//  new this time
import ScatterMurtyVsNsd from './scatterplot.jsx';
import HeatmapByROI from './heatMapRoi.jsx';
import RoiBarChart from './roiDatasetBarChart.jsx';

import ChartSelect from './chartselect.jsx';


const ScoreboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const { data, loading } = useLoadData();
  
  const [manualStepChange, setManualStepChange] = useState(false);

  const DEFAULT_TRAINING = ""
  const DEFAULT_DATASET_EMPTY= ""   
  const DEFAULT_REGION = "Overall";
  const DEFAULT_DATASET = "";
  const DEFAULT_REGION_EMPTY = "";
  

  const [datasetEmpty, setDatasetEmpty] = useState(DEFAULT_DATASET_EMPTY);
  const [dataset, setDataset] = useState(DEFAULT_DATASET);
  const [training, setTraining] = useState(DEFAULT_TRAINING);
  const [regionEmpty, setRegionEmpty] = useState(DEFAULT_REGION_EMPTY);
  const [region, setRegion] = useState(DEFAULT_REGION);


  const [chartType, setChartType] = useState("uni");   
  const [chartScope, setChartScope] = useState("all");


  // step 0 clear value logic
  useEffect(() => {
    if (current === 0 && training === "") {
      setDatasetEmpty("");
    }
  }, [current, training])

  //step 1 clear value logic
  useEffect(() => {
    if (current === 1 && region === "") {
      setTraining("");
      setDatasetEmpty("");
    }
  }, [current, region]);
  useEffect(() => {
    if (current === 1 && training === "") {
      setDatasetEmpty("");
    }
  }, [current, training]);

  // step 2 clear value logic
  useEffect(() => {
    if (current === 2 && dataset === "") {
      setTraining("");
      setRegionEmpty("");
    }
  }, [current, dataset]);
  useEffect(() => {
    if (current === 2 && training === "") {
      setRegionEmpty("");
    }
  }, [current, training]);

  
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
      return d.dataset === datasetEmpty ;
    } else {
      return d.dataset === dataset;
    }
  });
  const filteredRegionData : DataItem[] = filteredData.filter((d: DataItem) => d.roi === regionEmpty);
  

 type newData = {
  murty_uni?: Record<string, any>;
  nsd_uni?: Record<string, any>;
  murty_multi?: Record<string, any>;
  nsd_multi?: Record<string, any>;
};

  const { data: newData, loading: loadingNew } = useLoadDataNew() as {
    data: newData;
    loading: boolean;
  };


  const murtyUni = newData?.murty_uni;
  const nsdUni   = newData?.nsd_uni;
 

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
    if (manualStepChange) {
      setManualStepChange(false); 
    }
  }, [manualStepChange]);
  


  const steps = [
    {
      title: 'Overall Performance ',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>

          {/* panel display logic */}
          <ROISelect region={region} setRegion={setRegion} dataset={dataset} allowToggle={false} mode={1}/>
          {region != "" && ( <TrainingSelect training={training} setTraining={setTraining} dataset={dataset} mode = {1}/> ) }
          {region !== "" && training !== "" && (<DatasetSelect dataset={datasetEmpty} setDataset={setDatasetEmpty} training={training} allowToggle={true} mode = {1}/>)}
          
          {/* title display logic */}
          {!loadingNew && (
            <div className="chart-title">
              {training === "" && datasetEmpty === "" && newData
                ? `Cross-Regions Performence (Trained on Murty and Trained on NSD) `
                : training === "Murty185" && datasetEmpty === ""
                ? "Cross-Regions Performance (Trained on Murty185)"
                : training === "NSD" && datasetEmpty === ""
                ? "Cross-Regions Performance (Trained on NSD)"
                : training === "NSD" && datasetEmpty !== ""
                ? `Cross-Regions Performance on ${datasetEmpty} (Trained on NSD)`
                : training === "Murty185" && datasetEmpty !== ""
                ? `Cross-Regions Performance on ${datasetEmpty} (Trained on Murty185)`
                : ""}
            </div>
          )}

          <ChartSelect chartType={chartType} setChartType={setChartType} chartScope={chartScope} setChartScope={setChartScope}/>


        {!loadingNew && newData && training === "" && datasetEmpty === ""  && (
          <ScatterMurtyVsNsd 
            murtyData={newData.murty_uni} 
            nsdData={newData.nsd_uni} 
            roi= {region}
          />
        )}
          
          {/* {!loading && overallData.length > 0 && datasetEmpty === "" && (
            <HeatChartOverall dataset={overallData} title="Cross-Regions Performance on all Datasets" />
          )} */}

          {!loadingNew && datasetEmpty === "" && training === "Murty185" && (
            <HeatmapByROI
              data={newData.murty_uni}
              roi ={region}
              title="Cross-Regions Performance (Trained on Murty185)"
            />
          )}

          {!loadingNew && datasetEmpty === "" && training === "NSD" && (
            <HeatmapByROI
              data={newData.nsd_uni}
              roi ={region}
              title="Cross-Regions Performance (Trained on NSD)"
            />
          )}

          {/* {!loading && filteredOverallData.length > 0 && (
            <BarChartSpecific dataset={filteredOverallData} title={`Cross-Regions Performance on ${datasetEmpty}`} />
          )} */}

          {!loadingNew  && datasetEmpty != "" && training === "NSD" && (
             <RoiBarChart
              data={newData.nsd_uni}
              roi ={region}
              dataset={datasetEmpty}
              title={`${region} Performance on ${datasetEmpty}  (Trained on NSD)`}
            />

          )}

             {!loadingNew  && datasetEmpty != "" && training === "Murty185" && (
             <RoiBarChart
              data={newData.murty_uni}
              roi ={region}
              dataset={datasetEmpty}
              title={`${region} Performance on ${datasetEmpty}  (Trained on Murty 185)`}
            />

          )}

        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title: 'A specific ROI',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>

          {/* panel display logic */}
          <ROISelect region={region} setRegion={setRegion} dataset={dataset} allowToggle={true} mode={2}/>
          {region !== "" && ( <TrainingSelect training={training} setTraining={setTraining} dataset={dataset} mode = {2}/>)}
          {region !== "" && training!== "" && ( <DatasetSelect dataset={datasetEmpty} setDataset={setDatasetEmpty} training={training} allowToggle={true} mode = {2}/>)}


          {/* title display logic */}
          {!loadingNew && (
            <div className="chart-title">
              { region === "" && training === "" && datasetEmpty === "" && newData
                ? `Dataset and ROIs Effects`
                : training === "" && datasetEmpty === ""
                ? `${region} Performance (Trained on Murty185 and Trained on NSD)`
                : training === "Murty185" && datasetEmpty === ""
                ? `${region} Performance (Trained on Murty185)`
                : training === "NSD" && datasetEmpty === ""
                ? `${region} Performance (Trained on NSD)`
                : training === "NSD" && datasetEmpty !== ""
                ? `${region} Performance on ${datasetEmpty} (Trained on NSD)`
                : training === "Murty185" && datasetEmpty !== ""
                ? `${region} Performance on ${datasetEmpty} (Trained on Murty185)`
                : ""}
            </div>
          )}

          <ChartSelect chartType={chartType} setChartType={setChartType} chartScope={chartScope} setChartScope={setChartScope}/>
         
          
          {/* {!loading && roiData.length > 0 && datasetEmpty === "" && (
            <HeatChartOverall dataset={roiData} title={`${region} Performance on all Datasets`} />
          )} */}

          {!loadingNew && datasetEmpty === "" && training === "Murty185" && (
            <HeatmapByROI
              data={newData.murty_uni}
              roi ={region.toLowerCase()}
              title={`${region} Performance on all Datasets (Trained on Murty 185)`}
            />
          )}

          {!loadingNew && datasetEmpty === "" && training === "NSD" && (
            <HeatmapByROI
              data={newData.nsd_uni}
              roi ={region.toLowerCase()}
              title={`${region} Performance on all Datasets (Trained on NSD 1000)`}
            />
          )}


          {/* {!loading && filtereROIData.length > 0 && (
            <BarChartSpecific dataset={filtereROIData} title={`${region} Performance on ${datasetEmpty}`} />
          )} */}

            {!loadingNew && newData && training === "" && datasetEmpty === ""  && (
          <ScatterMurtyVsNsd 
            murtyData={newData.murty_uni} 
            nsdData={newData.nsd_uni} 
            roi= {region.toLowerCase()}
          />
        )}

         {!loadingNew  && datasetEmpty != "" && training === "NSD" && (
             <RoiBarChart
              data={newData.nsd_uni}
              roi ={region.toLowerCase()}
              dataset={datasetEmpty}
              title={`${region} Performance on ${datasetEmpty}  (Trained on NSD)`}
            />

          )}

             {!loadingNew  && datasetEmpty != "" && training === "Murty185" && (
             <RoiBarChart
              data={newData.murty_uni}
              roi ={region.toLowerCase()}
              dataset={datasetEmpty}
              title={`${region} Performance on ${datasetEmpty}  (Trained on Murty 185)`}
            />

          )}

          
        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title: 'A specific Dataset',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>

          {/* panel display logic */}
          <DatasetSelect dataset={dataset} setDataset={setDataset} training={training} allowToggle={true} mode ={3}/>
          {dataset !== "" && (<TrainingSelect training={training} setTraining={setTraining} dataset={dataset} mode = {3}/>)}
          {dataset !== "" && training !== "" && (<ROISelect region={regionEmpty} setRegion={setRegionEmpty} dataset={dataset} allowToggle={true} mode={3}/>)}


          {/* title display logic */}
          {!loadingNew && (
            <div className="chart-title">
              { regionEmpty === "" && training === "" && dataset === "" && newData
                ? `Dataset and ROIs Effects`
                : training === "" && regionEmpty === ""
                ? `Performance on ${dataset}(Trained on Murty185 and Trained on NSD)`
                : training === "Murty185" && datasetEmpty === ""
                ? `Performance on ${dataset} (Trained on Murty185)`
                : training === "NSD" && regionEmpty === ""
                ? `Performance on ${dataset} (Trained on NSD)`
                : training === "NSD" && dataset !== ""
                ? `${regionEmpty} Performance on ${dataset} (Trained on NSD)`
                : training === "Murty185" && dataset !== ""
                ? `${regionEmpty} Performance on ${dataset} (Trained on Murty185)`
                : ""}
            </div>
          )}
         
          <ChartSelect chartType={chartType} setChartType={setChartType} chartScope={chartScope} setChartScope={setChartScope}/>
          
          {!loading &&  filteredData.length > 0 && regionEmpty === "" &&(
            <RoiHeatChart dataset={filteredData} title={`Models Performance on Evaluation Datasets: ${dataset}`}/>
          )}
          {!loading && filteredRegionData.length > 0 && (
            <BarChartSpecific dataset={filteredRegionData} title={`${regionEmpty} Performance on ${dataset}`} />
          )}
        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title:'Duplicate Table',
      icon: <SmileOutlined />,
    },
    {
      title:'Customized',
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
                setManualStepChange(true); 
                setCurrent(index);
                if (index === 0) {
                    setRegion("Overall");
                    setDatasetEmpty("");
                    setTraining("");
                } else if (index === 1) {
                    setRegion("");
                    setDatasetEmpty("");
                    setTraining("");
                } else if(index == 2) {
                    setRegionEmpty("");
                    setDataset("");
                    setTraining("");
                }
                
                
            }
        }
            style={{ cursor: 'pointer' }}
            />
        ))}
    </Steps>

      <div style={contentStyle}>{steps[current].content}</div>

    </>
  );
};

export default ScoreboardPage;
