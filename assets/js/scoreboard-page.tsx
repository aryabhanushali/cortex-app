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
import ScatterGapCeiling from './roiDatasetanalysis.jsx';

const ScoreboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const { data, loading } = useLoadData();
  
  const [manualStepChange, setManualStepChange] = useState(false);

  const DEFAULT_TRAINING = ""
  const DEFAULT_DATASET_EMPTY= ""   
  const DEFAULT_REGION = "";
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
  //group by ppa
  murty_uni?: Record<string, any>;
  nsd_uni?: Record<string, any>;
  murty_multi?: Record<string, any>;
  nsd_multi?: Record<string, any>;

  // 
  ceiling_uni?: Record<string, any>;
  ceiling_multi?: Record<string, any>;

    
  roi_dataset_Murty185_uni?: Record<string, any>;
  roi_dataset_Murty185_multi?: Record<string, any>;
  roi_dataset_NSD_uni?: Record<string, any>;
  roi_dataset_NSD_multi?: Record<string, any>;
};

  const { data: newData, loading: loadingNew } = useLoadDataNew() as {
    data: newData;
    loading: boolean;
  };


  const murtyData = chartType === "uni" ? newData?.murty_uni : newData?.murty_multi;
  const nsdData   = chartType === "uni" ? newData?.nsd_uni   : newData?.nsd_multi;
  const ROI_DATASET_Murty = chartType === "uni" ? newData?.roi_dataset_Murty185_uni : newData?.roi_dataset_Murty185_multi;
  const ROI_DATASET_NSD = chartType === "uni" ? newData?.roi_dataset_NSD_uni : newData?.roi_dataset_NSD_multi;
  const Ceiling = chartType === "uni" ? newData?.ceiling_uni : newData?.ceiling_multi;


 

  const contentStyle: React.CSSProperties = {
    // lineHeight: '260px',
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
      title: 'Training Sources',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>

          {/* panel display logic */}
           <TrainingSelect training={training} setTraining={setTraining} dataset={dataset} mode = {1}/> 
          {training !== "" && (<DatasetSelect dataset={datasetEmpty} setDataset={setDatasetEmpty} training={training} allowToggle={true} mode = {1}/>)}
          {datasetEmpty !== "" && training !== "" && (<ROISelect region={region} setRegion={setRegion} dataset={dataset} allowToggle={true} mode={1}/>)
         } 
          
          
          
          {/* title display logic */}
          {!loadingNew && (
            <div className="chart-title">
              {training === "" && datasetEmpty === "" &&  region === ""
                ? `Across-Regions Performence (Trained on Murty vs Trained on NSD1000) `
                : training === "Murty185" && datasetEmpty === "" && region === ""
                ? "Across-Regions Performance (Trained on Murty185)"
                : training === "NSD" && datasetEmpty === ""  && region === ""
                ? "Across-Regions Performance (Trained on NSD1000)"
                : training === "Murty185" && datasetEmpty !== "" && region === ""
                ? `Across-Regions Performance on ${datasetEmpty} (Trained on Murty185)`
                : training === "NSD" && datasetEmpty !== "" && region !== "Overall"
                ? `Across-Regions Performance on ${datasetEmpty} (Trained on NSD1000)`
                : training === "Murty185" && datasetEmpty !== "" && region !== "Overall"
                ? `${region.toUpperCase()}  Performance on ${datasetEmpty} (Trained on Murty185)`
                : training === "NSD" && datasetEmpty !== "" && region !== "Overall"
                ? `${region.toUpperCase()}  Performance on ${datasetEmpty} (Trained on NSD1000)`
                : ""}
            </div>
          )}

          <ChartSelect chartType={chartType} setChartType={setChartType} chartScope={chartScope} setChartScope={setChartScope}/>

        {/* scatter */}
        {!loadingNew && newData && training === "" && datasetEmpty === ""  && region === "" && (
          <ScatterMurtyVsNsd 
            murtyData={murtyData} 
            nsdData={nsdData} 
            roi= {"Overall"}
          />
        )}
          
          {/* heatmap */}
          {!loadingNew && datasetEmpty === "" && training === "Murty185" &&  region === "" &&(
            <HeatmapByROI
              data={murtyData}
              roi ={"Overall"}
            />
          )}

          {!loadingNew && datasetEmpty === "" && training === "NSD" &&  region === "" && (
            <HeatmapByROI
              data={nsdData}
              roi ={"Overall"}
            />
          )}

          {/* BarChart */}

          {!loadingNew && datasetEmpty !== "" && training === "NSD" && (
            <RoiBarChart
              data={nsdData}
              roi={region === "" ? "Overall" : region.toLowerCase()}   // ✅ region为空 → overall
              dataset={datasetEmpty}
              ceiling = {Ceiling}
            />
          )}

          {!loadingNew && datasetEmpty !== "" && training === "Murty185" && (
            <RoiBarChart
              data={murtyData}
              roi={region === "" ? "Overall" : region.toLowerCase()}   // ✅ 同理
              dataset={datasetEmpty}
              ceiling = {Ceiling}
            />
          )}

        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title: 'ROI',
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
                ? `Averaged Normalized Gap vs. Ceiling (Across Train Sources)`
                : training === "" && datasetEmpty === ""
                ? `${region.toUpperCase()} : Averaged Normalized Gap vs. Ceiling (Across Train Sources)`
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

          {/* ScatterGapCeiling */}
          {!loadingNew && datasetEmpty === "" && training === ""  && region === "" && (
            <ScatterGapCeiling nsdData={ROI_DATASET_NSD} murtyData={ROI_DATASET_Murty} ceilingData={Ceiling} roi = {region}/>
          )}
          {!loadingNew && datasetEmpty === "" && training === ""  && region !== "" &&(
            <ScatterGapCeiling nsdData={ROI_DATASET_NSD} murtyData={ROI_DATASET_Murty} ceilingData={Ceiling} roi = {region}/>
          )}



           {!loadingNew && newData && datasetEmpty === "" && training === "VS"  && (
            <ScatterMurtyVsNsd 
              murtyData={murtyData} 
              nsdData={nsdData} 
              roi= {region}
            />
          )} 



          {/* heatmap */}
          {!loadingNew && datasetEmpty === "" && training === "Murty185" &&(
            <HeatmapByROI
              data={murtyData}
              roi ={region}
            />
          )}
          {!loadingNew && datasetEmpty === "" && training === "NSD" &&(
            <HeatmapByROI
              data={murtyData}
              roi ={region}
            />
          )}


           

          {/* {!loadingNew && newData && training !== "" && datasetEmpty === ""  && (
              <ScatterMurtyVsNsd 
                murtyData={murtyData} 
                nsdData={nsdData} 
                roi= {region}
              />
            )}  */}


         {/* {!loadingNew  && datasetEmpty != "" && training === "NSD" && (
             <RoiBarChart
              data={newData.nsd_uni}
              roi ={region.toLowerCase()}
              dataset={datasetEmpty}
              ceiling = {Ceiling}
              
            />

          )}

             {!loadingNew  && datasetEmpty != "" && training === "Murty185" && (
             <RoiBarChart
              data={newData.murty_uni}
              roi ={region.toLowerCase()}
              dataset={datasetEmpty}
              ceiling = {Ceiling}
             
            />

          )} */}

          
        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title: 'Dataset',
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
                ? `Averaged Normalized Gap vs. Ceiling (Across Train Sources)`
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
                    setRegion("");
                    setDatasetEmpty("");
                    setTraining("");
                    setChartType("uni")
                } else if (index === 1) {
                    setRegion("");
                    setDatasetEmpty("");
                    setTraining("");
                    setChartType("uni");
                } else if(index == 2) {
                    setRegionEmpty("");
                    setDataset("");
                    setTraining("");
                    setChartType("uni");
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
