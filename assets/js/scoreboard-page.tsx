import React, { useState, useEffect } from 'react';
import { Button, message, Steps, theme } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

import ROISelect from './roiselect.jsx';
import TrainingSelect from './trainingselect.jsx';
import DatasetSelect from './datasetselect.jsx';
import useLoadData from './loaddata.jsx';
import useLoadDataNew from './loadDataNew.jsx';


//  new this time
import ScatterMurtyVsNsd from './scatterplot.jsx';
import HeatmapByROI from './heatMapRoi.jsx';
import RoiBarChart from './roiDatasetBarChart.jsx';

import ChartSelect from './chartselect.jsx';
import ScatterGapCeiling from './roiDatasetanalysis.jsx';
import ROICard from './roicard.jsx';
import DatasetCard from './datasetcard.jsx';
import ModelCard from './modelcard.jsx';

import JSZip from "jszip";
import { saveAs } from "file-saver";

const ScoreboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const { data, loading } = useLoadData();
  
  const [manualStepChange, setManualStepChange] = useState(false);

  const DEFAULT_TRAINING = "NSD"
  const DEFAULT_REGION = "";
  const DEFAULT_DATASET = "";
  const EMPTY_TRAINING = ""

  


  const [dataset, setDataset] = useState(DEFAULT_DATASET);
  const [training, setTraining] = useState(DEFAULT_TRAINING);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [emptyTraining, setEmptyTraining] = useState(EMPTY_TRAINING);


  const [chartType, setChartType] = useState("uni");   
  const [rank, setRank] = useState("rank");
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  const DATASET_LABEL_MAP: Record<string, string> = {
    murty185: "Murty185",
    nsd_1000: "NSD1000",
    bold_5000: "BOLD5000v2",
    bonner_2021: "Bonner2021",
    bmd_2024: "BMD2024",
    kingbaker_2019: "King2019",
    wardle_2020: "Wardle2020",
    nsd_syn: "NSD synthetic",
};


  const getEnable = (current: number, training: string, dataset: string, region: string) => {

    if (current === 0) {
   
      return training !== "";
    }
    if (current === 1) {
      // ROI 页：当 region 选中且 dataset 已经选定时才启用
      return false
    }
    if (current === 2) {
      // Dataset 页：当 dataset 已选择时才启用
      return false
    }
    return false;
  };



    const handleDownloadZip = async () => {
    if (!newData) {
      message.error("No raw data available to download.");
      return;
    }

    const zip = new JSZip();

    // 遍历 newData 的 key，把每个 JSON 存进去
    Object.entries(newData).forEach(([key, value]) => {
      const jsonString = JSON.stringify(value, null, 2);
      zip.file(`${key}.json`, jsonString);
    });

    try {
      const blob = await zip.generateAsync({ type: "blob" });
      saveAs(blob, "raw_data.zip");
      message.success("Raw data downloaded as raw_data.zip!");
    } catch (err) {
      console.error("ZIP generation error:", err);
      message.error("Failed to generate ZIP file.");
    }
  };


  // step 0 clear value logic
  // useEffect(() => {
  //   if (current === 0 && region) {
  //     setDataset("");
  //     setRegion("");
  //   } 
  //   if (current === 0 && dataset === ""){
  //     setRegion("");
  //   } 
  // }, [current, training,dataset])

  //step 1 clear value logic
  // useEffect(() => {
  //   if (current === 1 && region === "") {
  //     setTraining("");
  //     setDataset("");
  //   } 
  //   if (current === 1 && training === "") {
  //     setDataset("");
  //   }
  // }, [current, region,training]);
  

  useEffect(() => {
    if (current === 2 && dataset === "") {
      setTraining("");
      setRegion("");
    } 
    if (current === 2 && training === "") {
      setRegion("");
    }
    if(current === 2 && training === "VS" && (dataset === "bonner_2021" || dataset === "bold_5000")){
      setRegion("ppa");
    }
  }, [current, dataset,training]);

  


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
  const yLabel = chartType === "uni" ? "Pearson Correlation" : "Spearman Correlation";


 

  const contentStyle: React.CSSProperties = {

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
      title: 'Models',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>

          {/* panel display logic */}
          <TrainingSelect training={training} setTraining={setTraining} dataset={dataset} mode = {1} allowToggle={false}/> 
          <ROISelect region={region} setRegion={setRegion} dataset={dataset} setDataset={setDataset} allowToggle={true} mode={1} training={training}/>
          <DatasetSelect dataset={dataset} setDataset={setDataset} training={training} region = {region} allowToggle={true} mode = {1}/>
          
          
          
          {/* title display logic */}
          {!loadingNew && (
            <div className="chart-title">
              {training === "" && dataset === "" &&  region === ""
                ? `Across-ROIs Performence (Trained on Murty185 vs Trained on NSD1000) `
                : training === "Murty185" && dataset === "" && region === ""
                ? "Across-ROIs Performance (Trained on Murty185)"
                : training === "NSD" && dataset === ""  && region === ""
                ? "Across-ROIs Performance (Trained on NSD1000)"
                : training === "Murty185" && dataset !== "" && region === ""
                ? `Across-ROIs Performance on ${dataset} (Trained on Murty185)`
                : training === "NSD" && dataset !== "" && region !== "Overall"
                ? `Across-ROIs Performance on ${dataset} (Trained on NSD1000)`
                : training === "Murty185" && dataset !== "" && region !== "Overall"
                ? `${region.toUpperCase()}  Performance on ${dataset} (Trained on Murty185)`
                : training === "NSD" && dataset !== "" && region !== "Overall"
                ? `${region.toUpperCase()}  Performance on ${dataset} (Trained on NSD1000)`
                : ""}
            </div>
          )}

          <ChartSelect chartType={chartType} setChartType={setChartType} rank={rank} setRank={setRank} enable={getEnable(current, training, dataset, region)}/>


          {/* heatmap */}
          {!loadingNew && dataset === "" && training === "Murty185" &&  region === "" &&(
            <HeatmapByROI
              data={murtyData}
              roi ={"Overall"}
              dataset = {dataset}
              rank = {rank}
              onModelClick={(model: string) => setSelectedModel(model)} 
            />
          )}

          {!loadingNew && dataset === "" && training === "NSD" &&  region === "" && (
            <HeatmapByROI
              data={nsdData}
              roi ={"Overall"}
              dataset = {dataset}
              rank = {rank}
              onModelClick={(model: string) => setSelectedModel(model)} 
            />
          )}

            {!loadingNew && dataset === "" && training === "NSD" &&  region !== "" && (
            <HeatmapByROI
              data={nsdData}
              roi ={region}
              dataset = {dataset}
              rank = {rank}
              onModelClick={(model: string) => setSelectedModel(model)} 
            />
          )}


            {!loadingNew && dataset === "" && training === "Murty185" &&  region !== "" && (
            <HeatmapByROI
              data={murtyData}
              roi ={region}
              dataset = {dataset}
              rank = {rank}
              onModelClick={(model: string) => setSelectedModel(model)} 
            />
          )}
          
           {!loadingNew && dataset !== "" && training === "NSD" &&  region === "" && (
            <HeatmapByROI
              data={nsdData}
              roi ={region}
              dataset = {dataset}
              rank = {rank}
              onModelClick={(model: string) => setSelectedModel(model)} 
            />
          )}


            {!loadingNew && dataset !== "" && training === "Murty185" &&  region === "" && (
            <HeatmapByROI
              data={murtyData}
              roi ={region}
              dataset = {dataset}
              rank = {rank}
              onModelClick={(model: string) => setSelectedModel(model)} 
            />
          )}



          {/* BarChart */}

          {!loadingNew && dataset !== "" && training === "NSD" && region !== "" && (
            <RoiBarChart
              data={nsdData}
              roi={region === "" ? "Overall" : region.toLowerCase()}   // ✅ region为空 → overall
              dataset={dataset}
              ceiling = {Ceiling}
              rank = {rank}
              yLabel={yLabel}
            />
          )}

          {!loadingNew && dataset !== "" && training === "Murty185" && region !== "" && (
            <RoiBarChart
              data={murtyData}
              roi={region === "" ? "Overall" : region.toLowerCase()}   // ✅ 同理
              dataset={dataset}
              ceiling = {Ceiling}
              rank = {rank}
              yLabel={yLabel}
            />
          )}

          {selectedModel  && (
             <ModelCard  region={"ppa"} dataset={"nsd_1000"} model={selectedModel}/>
          )
          }

          {training === "Murty185" && (
            <DatasetCard dataset={"murty185"}/>
          )
          }
          {training === "NSD" && (
            <DatasetCard dataset={"nsd_1000"}/>
          )
          }

          {dataset !== "" && (
            <DatasetCard dataset={dataset}/>
          )
          }
          {region !== "" && (
            <ROICard region={region}/>
          )
          }

          
          <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              style={{ marginTop: 16, width: "150px" }}
              onClick={handleDownloadZip}
            >
              Download Raw Data
            </Button>
        </div>
          
        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title: 'ROI',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>

          {/* panel display logic */}
          <ROISelect region={region} setRegion={setRegion} dataset={dataset} setDataset={setDataset} allowToggle={true} mode={2} training={training}/>
          <TrainingSelect training={emptyTraining} setTraining={setEmptyTraining} dataset={dataset} mode = {2} allowToggle={true}/> 
          

          {/* title display logic */}
          {!loadingNew && (
            <div className="chart-title">
              { region === "" && emptyTraining === "" && dataset === "" && newData
                ? `Model Performance Gap to Ceiling vs Ceiling`
                : emptyTraining === "" && dataset === ""
                ? `${region.toUpperCase()} : Model Performance Gap to Ceiling vs Ceiling`
                : emptyTraining === "VS" && dataset === ""
                ? `${region.toUpperCase()} Performance (Trained on Murty185 and Trained on NSD)`
                : emptyTraining === "Murty185" && dataset === ""
                ? `${region.toUpperCase()} Performance (Trained on Murty185)`
                : emptyTraining === "NSD" && dataset === ""
                ? `${region.toUpperCase()} Performance (Trained on NSD)`
                : emptyTraining === "VS" && dataset !== ""
                ? `${region.toUpperCase()} Performance on ${dataset}(Trained on Murty185 and Trained on NSD)`
                : emptyTraining === "NSD" && dataset !== ""
                ? `${region.toUpperCase()} Performance on ${dataset} (Trained on NSD)`
                : emptyTraining === "Murty185" && dataset !== ""
                ? `${region.toUpperCase()} Performance on ${dataset} (Trained on Murty185)`
                : ""}
            </div>
          )}

         <ChartSelect chartType={chartType} setChartType={setChartType} rank={rank} setRank={setRank} enable={getEnable(current, training, dataset, region)}/>

          {/* ScatterGapCeiling */}
          {!loadingNew && emptyTraining === ""  && region === "" && (
            <ScatterGapCeiling nsdData={ROI_DATASET_NSD} murtyData={ROI_DATASET_Murty} ceilingData={Ceiling} roi = {region} dataset={dataset}/>
          )}
          {!loadingNew && emptyTraining === ""  && region !== "" &&(
            <ScatterGapCeiling nsdData={ROI_DATASET_NSD} murtyData={ROI_DATASET_Murty} ceilingData={Ceiling} roi = {region} dataset={dataset}/>
          )}

          

         

          {/* barchart */}
           

         {!loadingNew  && dataset != "" && training === "NSD" && 
          (<RoiBarChart data={nsdData} roi ={region.toLowerCase()} dataset={dataset} ceiling = {Ceiling} rank = {rank} yLabel ={yLabel}/>)
         }

          {!loadingNew  && dataset != "" && training === "Murty185" && (
             <RoiBarChart
              data={murtyData}
              roi ={region}
              dataset={dataset}
              ceiling = {Ceiling}
              rank = {rank}
              yLabel={yLabel}
             
            />

          )}

           {region !== "" && (
            <ROICard region={region}/>
          )
          }
          {emptyTraining === "Murty185" && (
            <DatasetCard dataset={"murty185"}/>
          )
          }
          {emptyTraining === "NSD" && (
            <DatasetCard dataset={"nsd_1000"}/>
          )
          }
    

             <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              style={{ marginTop: 16, width: "150px" }}
              onClick={handleDownloadZip}
            >
              Download Raw Data
            </Button>
        </div>
         

          
        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title: 'Dataset',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>

          {/* panel display logic */}
          <DatasetSelect dataset={dataset} setDataset={setDataset} training={emptyTraining} region = {region} allowToggle={true} mode ={3}/>
          <TrainingSelect training={emptyTraining} setTraining={setEmptyTraining} dataset={dataset} mode = {3} allowToggle={true}/>
     
          {/* title display logic */}
          {!loadingNew && (
            <div className="chart-title">
              { region === "" && emptyTraining === "" && dataset === "" && newData
                ? `Model Performance Gap to Ceiling vs Ceiling`
                : emptyTraining === "" && region === "" && dataset !== ""
                ? `Model Performance Gap to Ceiling vs Ceiling`
                : emptyTraining === "VS" && region === "" 
                ? `Accross-Regions Performance on ${dataset}(Trained on Murty185 and Trained on NSD)`
                : emptyTraining === "Murty185" && dataset === ""
                ? `Performance on ${dataset} (Trained on Murty185)`
                : emptyTraining === "NSD" && region === ""
                ? `Performance on ${dataset} (Trained on NSD)`
                : emptyTraining === "VS" && region !== "" 
                ? `${region.toUpperCase()}Performance on ${dataset}(Trained on Murty185 and Trained on NSD)`
                : emptyTraining === "NSD" && dataset !== ""
                ? `${region.toUpperCase()} Performance on ${dataset} (Trained on NSD)`
                : emptyTraining === "Murty185" && dataset !== ""
                ? `${region.toUpperCase()} Performance on ${dataset} (Trained on Murty185)`
                : ""}
            </div>
          )}
         
          <ChartSelect chartType={chartType} setChartType={setChartType} rank={rank} setRank={setRank} enable={getEnable(current, training, dataset, region)}/>
          
  

          {/* ScatterGapCeiling */}
          {!loadingNew && dataset === "" && emptyTraining === ""   && (
            <ScatterGapCeiling nsdData={ROI_DATASET_NSD} murtyData={ROI_DATASET_Murty} ceilingData={Ceiling} roi = {region} dataset={dataset}/>
          )}

          {!loadingNew && dataset !== "" && emptyTraining === ""  && (
            <ScatterGapCeiling nsdData={ROI_DATASET_NSD} murtyData={ROI_DATASET_Murty} ceilingData={Ceiling} roi = {region} dataset={dataset}/>
          )}


    

           {dataset !== "" && (
            <DatasetCard dataset={dataset}/>
          )
          }
         
          {emptyTraining === "Murty185" && (
            <DatasetCard dataset={"murty185"}/>
          )
          }
          {emptyTraining === "NSD" && (
            <DatasetCard dataset={"nsd_1000"}/>
          )
          }
          
           {region !== "" && (
            <ROICard region={region}/>
          )
          }
            <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              style={{ marginTop: 16, width: "150px" }}
              onClick={handleDownloadZip}
            >
              Download Raw Data
            </Button>
        </div>
         
       
        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title: 'Training Sources',

      content: (

        <div style={{ display: 'flex', flexDirection: 'column'}}>

          {/* panel display logic */}
          <ROISelect region={region} setRegion={setRegion} dataset={dataset} setDataset={setDataset} allowToggle={true} mode={2} training={training}/>
          <DatasetSelect dataset={dataset} setDataset={setDataset} training={setTraining} region = {region} allowToggle={true} mode ={4}/>
         
     
          {/* title display logic */}
          {!loadingNew && (
            <div className="chart-title">
              { region === "" && dataset === "" && newData
                ? `Model Performance Gap to Ceiling vs Ceiling`
                :region !== "" && dataset === "" && newData
                ? `${region.toUpperCase()}: Model Performance Gap to Ceiling vs Ceiling`
                :region === "" && dataset !== "" && newData
                ? `${DATASET_LABEL_MAP[dataset]}: Model Performance Gap to Ceiling vs Ceiling`

                :region !== "" && dataset !== "" && newData
                ? `${region.toUpperCase()}/${DATASET_LABEL_MAP[dataset]}: Model Performance Gap to Ceiling vs Ceiling`


                : ""}

            </div>
          )}
         
          <ChartSelect chartType={chartType} setChartType={setChartType} rank={rank} setRank={setRank} enable={getEnable(current, training, dataset, region)}/>
          
  

          {/* Scatter */}
          {!loadingNew && dataset === "" && region === ""   && (
            <ScatterMurtyVsNsd nsdData={nsdData} murtyData={murtyData} roi={"Overall"} dataset={dataset} chartType={chartType} showOverlay={true}/>
          )}


          {!loadingNew && dataset !== "" && region === ""   && (
            <ScatterMurtyVsNsd nsdData={nsdData} murtyData={murtyData} roi={"Overall"} dataset={dataset} chartType={chartType} showOverlay={false}/>
          )}

          {!loadingNew && dataset === "" && region !== ""   && (
            <ScatterMurtyVsNsd nsdData={nsdData} murtyData={murtyData} roi={region} dataset={dataset} chartType={chartType} showOverlay={false}/>
          )}

           {!loadingNew && dataset !== "" && region !== ""   && (
            <ScatterMurtyVsNsd nsdData={nsdData} murtyData={murtyData} roi={region} dataset={dataset} chartType={chartType} showOverlay={false}/>
          )}

           {dataset !== "" && (
            <DatasetCard dataset={dataset}/>
          )
          }
         
          {emptyTraining === "Murty185" && (
            <DatasetCard dataset={"murty185"}/>
          )
          }
          {emptyTraining === "NSD" && (
            <DatasetCard dataset={"nsd_1000"}/>
          )
          }
          
           {region !== "" && (
            <ROICard region={region}/>
          )
          }
            <div style={{ textAlign: "right" }}>
            <Button
              type="primary"
              style={{ marginTop: 16, width: "150px" }}
              onClick={handleDownloadZip}
            >
              Download Raw Data
            </Button>
        </div>
         
       
        </div>

      ),
      icon: <SmileOutlined />,

    }
    
    

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
                    setDataset("");
                    setTraining("Murty185");
                    setChartType("uni")
                    setRank("rank");
                } else if (index === 1) {
                    setRegion("");
                    setEmptyTraining("");
                    setChartType("uni");
                    setRank("rank");
                } else if(index == 2) {
      
                    setDataset("");
                    setEmptyTraining("");
                    setChartType("uni");
                    setRank("rank");
                } else if(index == 3) {
                    setDataset("");
                    setRegion("");
                    setChartType("uni");
                    setRank("rank");
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
