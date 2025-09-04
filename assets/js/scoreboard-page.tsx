import React, { useState, useEffect } from 'react';
import { Button, message, Steps, theme } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

import ROISelect from './roiselect.jsx';
import TrainingSelect from './trainingselect.jsx';
import DatasetSelect from './datasetselect.jsx';
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
import ROICard from './roicard.jsx';
import DatasetCard from './datasetcard.jsx';

import JSZip from "jszip";
import { saveAs } from "file-saver";

const ScoreboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const { data, loading } = useLoadData();
  
  const [manualStepChange, setManualStepChange] = useState(false);

  const DEFAULT_TRAINING = ""
  const DEFAULT_REGION = "";
  const DEFAULT_DATASET = "";

  


  const [dataset, setDataset] = useState(DEFAULT_DATASET);
  const [training, setTraining] = useState(DEFAULT_TRAINING);
  const [region, setRegion] = useState(DEFAULT_REGION);


  const [chartType, setChartType] = useState("uni");   
  const [rank, setRank] = useState("");


  const getEnable = (current: number, training: string, dataset: string, region: string) => {

    if (current === 0) {
   
      return training !== "";
    }
    if (current === 1) {
      // ROI 页：当 region 选中且 dataset 已经选定时才启用
      return region !== ""  && (training === "Murty185" ||training === "NSD")  ;
    }
    if (current === 2) {
      // Dataset 页：当 dataset 已选择时才启用
      return dataset !== "" && training !== "";
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
  useEffect(() => {
    if (current === 0 && training === "") {
      setDataset("");
      setRegion("");
    } 
    if (current === 0 && dataset === ""){
      setRegion("");
    } 
  }, [current, training,dataset])

  //step 1 clear value logic
  useEffect(() => {
    if (current === 1 && region === "") {
      setTraining("");
      setDataset("");
    } 
    if (current === 1 && training === "") {
      setDataset("");
    }
  }, [current, region,training]);
  

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
      title: 'Training Source',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>

          {/* panel display logic */}
           <TrainingSelect training={training} setTraining={setTraining} dataset={dataset} mode = {1}/> 
          {training !== "" && (<DatasetSelect dataset={dataset} setDataset={setDataset} training={training} region = {region} allowToggle={true} mode = {1}/>)}
          {dataset !== "" && training !== "" && (<ROISelect region={region} setRegion={setRegion} dataset={dataset} allowToggle={true} mode={1} training={training}/>)
         } 
          
          
          
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

        {/* scatter */}
        {!loadingNew && newData && training === "" && dataset === ""  && region === "" && (
          <ScatterMurtyVsNsd 
            murtyData={murtyData} 
            nsdData={nsdData} 
            roi= {"Overall"}
            dataset = {dataset}
            chartType={chartType} showOverlay={true}
          />
        )}
          
          {/* heatmap */}
          {!loadingNew && dataset === "" && training === "Murty185" &&  region === "" &&(
            <HeatmapByROI
              data={murtyData}
              roi ={"Overall"}
              dataset = {dataset}
              rank = {rank}
            />
          )}

          {!loadingNew && dataset === "" && training === "NSD" &&  region === "" && (
            <HeatmapByROI
              data={nsdData}
              roi ={"Overall"}
              dataset = {dataset}
              rank = {rank}
            />
          )}

          {/* BarChart */}

          {!loadingNew && dataset !== "" && training === "NSD" && (
            <RoiBarChart
              data={nsdData}
              roi={region === "" ? "Overall" : region.toLowerCase()}   // ✅ region为空 → overall
              dataset={dataset}
              ceiling = {Ceiling}
              rank = {rank}
              yLabel={yLabel}
            />
          )}

          {!loadingNew && dataset !== "" && training === "Murty185" && (
            <RoiBarChart
              data={murtyData}
              roi={region === "" ? "Overall" : region.toLowerCase()}   // ✅ 同理
              dataset={dataset}
              ceiling = {Ceiling}
              rank = {rank}
              yLabel={yLabel}
            />
          )}

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
          <ROISelect region={region} setRegion={setRegion} dataset={dataset} allowToggle={true} mode={2} training={training}/>
          {region !== "" && ( <TrainingSelect training={training} setTraining={setTraining} dataset={dataset} mode = {2}/>)}
          {region !== "" && training!== "" && ( <DatasetSelect dataset={dataset} setDataset={setDataset} training={training} region = {region} allowToggle={true} mode = {2}/>)}


          {/* title display logic */}
          {!loadingNew && (
            <div className="chart-title">
              { region === "" && training === "" && dataset === "" && newData
                ? `Model Performance Gap to Ceiling vs Ceiling`
                : training === "" && dataset === ""
                ? `${region.toUpperCase()} : Model Performance Gap to Ceiling vs Ceiling`
                : training === "VS" && dataset === ""
                ? `${region.toUpperCase()} Performance (Trained on Murty185 and Trained on NSD)`
                : training === "Murty185" && dataset === ""
                ? `${region.toUpperCase()} Performance (Trained on Murty185)`
                : training === "NSD" && dataset === ""
                ? `${region.toUpperCase()} Performance (Trained on NSD)`
                : training === "VS" && dataset !== ""
                ? `${region.toUpperCase()} Performance on ${dataset}(Trained on Murty185 and Trained on NSD)`
                : training === "NSD" && dataset !== ""
                ? `${region.toUpperCase()} Performance on ${dataset} (Trained on NSD)`
                : training === "Murty185" && dataset !== ""
                ? `${region.toUpperCase()} Performance on ${dataset} (Trained on Murty185)`
                : ""}
            </div>
          )}

         <ChartSelect chartType={chartType} setChartType={setChartType} rank={rank} setRank={setRank} enable={getEnable(current, training, dataset, region)}/>

          {/* ScatterGapCeiling */}
          {!loadingNew && dataset === "" && training === ""  && region === "" && (
            <ScatterGapCeiling nsdData={ROI_DATASET_NSD} murtyData={ROI_DATASET_Murty} ceilingData={Ceiling} roi = {region} dataset={dataset}/>
          )}
          {!loadingNew && dataset === "" && training === ""  && region !== "" &&(
            <ScatterGapCeiling nsdData={ROI_DATASET_NSD} murtyData={ROI_DATASET_Murty} ceilingData={Ceiling} roi = {region} dataset={dataset}/>
          )}

          {/* murty vs nsd */}
           {!loadingNew && newData && dataset === "" && training === "VS"  && (
            <ScatterMurtyVsNsd murtyData={murtyData} nsdData={nsdData} roi= {region} dataset = {dataset} chartType={chartType} showOverlay={false}/>
          )} 
          {!loadingNew && newData && dataset !== "" && training === "VS"  && (
            <ScatterMurtyVsNsd murtyData={murtyData} nsdData={nsdData} roi= {region} dataset = {dataset} chartType={chartType} showOverlay={false} />
          )} 




          {/* heatmap */}
          {!loadingNew && dataset === "" && training === "Murty185" &&(
            <HeatmapByROI
              data={murtyData}
              roi ={region}
              dataset={dataset}
              rank = {rank}
            />
          )}
          {!loadingNew && dataset === "" && training === "NSD" &&(
            <HeatmapByROI
              data={nsdData}
              roi ={region}
              dataset ={dataset}
              rank = {rank}
            />
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
          {training === "Murty185" && (
            <DatasetCard dataset={"murty185"}/>
          )
          }
          {training === "NSD" && (
            <DatasetCard dataset={"nsd_1000"}/>
          )
          }
          {training === "VS" && [
            <DatasetCard key="murty" dataset="murty185" />,
            <DatasetCard key="nsd" dataset="nsd_1000" />
          ]}
          {dataset !== "" && (
            <DatasetCard dataset={dataset}/>
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
          <DatasetSelect dataset={dataset} setDataset={setDataset} training={training} region = {region} allowToggle={true} mode ={3}/>
          {dataset !== "" && (<TrainingSelect training={training} setTraining={setTraining} dataset={dataset} mode = {3}/>)}
          {dataset !== "" && training !== "" && (<ROISelect region={region} setRegion={setRegion} dataset={dataset} allowToggle={true} mode={3} training={training}/>)}


          {/* title display logic */}
          {!loadingNew && (
            <div className="chart-title">
              { region === "" && training === "" && dataset === "" && newData
                ? `Model Performance Gap to Ceiling vs Ceiling`
                : training === "" && region === "" && dataset !== ""
                ? `Model Performance Gap to Ceiling vs Ceiling`
                : training === "VS" && region === "" 
                ? `Accross-Regions Performance on ${dataset}(Trained on Murty185 and Trained on NSD)`
                : training === "Murty185" && dataset === ""
                ? `Performance on ${dataset} (Trained on Murty185)`
                : training === "NSD" && region === ""
                ? `Performance on ${dataset} (Trained on NSD)`
                : training === "VS" && region !== "" 
                ? `${region.toUpperCase()}Performance on ${dataset}(Trained on Murty185 and Trained on NSD)`
                : training === "NSD" && dataset !== ""
                ? `${region.toUpperCase()} Performance on ${dataset} (Trained on NSD)`
                : training === "Murty185" && dataset !== ""
                ? `${region.toUpperCase()} Performance on ${dataset} (Trained on Murty185)`
                : ""}
            </div>
          )}
         
          <ChartSelect chartType={chartType} setChartType={setChartType} rank={rank} setRank={setRank} enable={getEnable(current, training, dataset, region)}/>
          
  

          {/* ScatterGapCeiling */}
          {!loadingNew && dataset === "" && training === ""  && region === "" && (
            <ScatterGapCeiling nsdData={ROI_DATASET_NSD} murtyData={ROI_DATASET_Murty} ceilingData={Ceiling} roi = {region} dataset={dataset}/>
          )}

          {!loadingNew && dataset !== "" && training === ""  && region === "" && (
            <ScatterGapCeiling nsdData={ROI_DATASET_NSD} murtyData={ROI_DATASET_Murty} ceilingData={Ceiling} roi = {region} dataset={dataset}/>
          )}


          {/* murty vs nsd */}
           {!loadingNew && newData && region === "" && training === "VS"  && (
            <ScatterMurtyVsNsd murtyData={murtyData} nsdData={nsdData} roi= {'Overall'} dataset = {dataset} chartType={chartType} showOverlay={false}/>
          )} 
          {!loadingNew && newData && region !== "" && training === "VS"  && (
            <ScatterMurtyVsNsd murtyData={murtyData} nsdData={nsdData} roi= {region} dataset = {dataset} chartType={chartType} showOverlay={false}/>
          )} 


             {/* heatmap */}
          {!loadingNew && region === "" && training === "Murty185" &&(
            <HeatmapByROI
              data={murtyData}
              dataset ={dataset}
              roi = {region}
              rank = {rank}
            />
          )}
          {!loadingNew && region === "" && training === "NSD" &&(
            <HeatmapByROI
              data={nsdData}
              dataset ={dataset}
              roi = {region}
              rank = {rank}
            />
          )}

          
         {!loadingNew  && region !== "" && training === "NSD" && 
          (<RoiBarChart data={nsdData} roi ={region.toLowerCase()} dataset={dataset} ceiling = {Ceiling} rank = {rank} yLabel={yLabel}/>)
         }

          {!loadingNew  && region !== "" && training === "Murty185" && (
             <RoiBarChart
              data={murtyData}
              roi ={region}
              dataset={dataset}
              ceiling = {Ceiling}
              rank = {rank}
              yLabel={yLabel}
            />
          )}


           {dataset !== "" && (
            <DatasetCard dataset={dataset}/>
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
          {training === "VS" && [
            <DatasetCard key="murty" dataset="murty185" />,
            <DatasetCard key="nsd" dataset="nsd_1000" />
          ]}

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
                    setTraining("");
                    setChartType("uni")
                    setRank("");
                } else if (index === 1) {
                    setRegion("");
                    setDataset("");
                    setTraining("");
                    setChartType("uni");
                    setRank("");
                } else if(index == 2) {
                    setRegion("");
                    setDataset("");
                    setTraining("");
                    setChartType("uni");
                    setRank("");
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
