import React, { useState, useEffect } from 'react';
import { Button, message, Steps, theme } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import Uploader from './uploader.tsx';
import BarChart from './barchart.jsx';
import Settings from './settings.jsx';
import Heatmap from './heatmap.jsx';
import { Client, handle_file} from "@gradio/client";
import { useMemo } from "react";
import Grid from '@mui/material';

import ROISelect from './roiselect.jsx';
import PaperSelector from './paperselector.jsx';
import ModelCard from './modelcard.jsx';
import LinearIndeterminate from './linearprogessor.jsx';

const { Step } = Steps;

const useBarchartData = (predictionResult: any) => {
  console.log("📊 Prediction Result for Bar Chart:", predictionResult);

  return useMemo(() => {
    if (!predictionResult || !Array.isArray(predictionResult) || predictionResult.length === 0) {
      console.log("❌ predictionResult is invalid or empty:", predictionResult);
      return [];
    }

    const data = predictionResult[0]; // Access the first (and only) object in the array

    if (!data.mean || !data.sem) {
      console.log("❌ predictionResult is missing required fields:", data);
      return [];
    }

    const processedData = Object.keys(data.mean).map((filename) => ({
      filename,
      mean: +data.mean[filename], // Convert to number
      sem: +data.sem[filename],   // Convert to number
    }));

    console.log("✅ Final Processed Bar Chart Data:", processedData);

    return processedData;
  }, [predictionResult]);
};

const useHeatmapData = (predictionResult: any) => {
  return useMemo(() => {
    if (!predictionResult || !Array.isArray(predictionResult) || predictionResult.length === 0) {
      console.log("❌ predictionResult is invalid or empty:", predictionResult);
      return { heatmapData: [], originalFilenames: [], sortedFilenames: [] };
    }

    const data = predictionResult[0];

    if (!data.rdm || !Array.isArray(data.rdm)) {
      console.log("❌ RDM data is missing or invalid:", data);
      return { heatmapData: [], originalFilenames: [], sortedFilenames: [] };
    }

    const rdm = data.rdm;
    const n = rdm.length;

    // Extract filenames from the mean or sem object
    const originalFilenames = Object.keys(data.mean || data.sem || {});

    // Create heatmap data with filenames
    const heatmapData = rdm.flatMap((row, i) =>
      row.map((value, j) => ({
        x: originalFilenames[i],
        y: originalFilenames[j],
        value
      }))
    );

    // For now, we'll use the original order for sortedFilenames
    // You can implement custom sorting logic here if needed
    const sortedFilenames = [...originalFilenames];

    console.log("✅ Processed Heatmap Data:", {
      heatmapData: heatmapData.slice(0, 5), // Log first 5 elements
      originalFilenames,
      sortedFilenames
    });

    return { heatmapData, originalFilenames, sortedFilenames };
  }, [predictionResult]);
};

const ScoreboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);
  const [predictstep, setPredictstep] = useState(1);

  const DEFAULT_OVERALL = "overall"
  const DEFAULT_ROI = "ffa";
  const DEFAULT_MODEL = "clip_rn50";
  const DEFAULT_DATASET = "murty185";
  const DEFAULT_VOXEL = "all-participants";

  const [model, setModel] = useState(DEFAULT_MODEL);
  const [dataset, setDataset] = useState(DEFAULT_DATASET);
  const [overall, setOverall] = useState(DEFAULT_OVERALL);
  const [roi, setROI] = useState(DEFAULT_ROI);
  const [voxelOption, setVoxelOption] = useState(DEFAULT_VOXEL);
  const [voxelNumber, setVoxelNumber] = useState("");
  const [paper, setPaper] = useState("");
  const [participantName, setParticipantName] = useState("");

  const [files, setFiles] = useState<{ blobURL: string; file: File }[]>([]);
  const [fileMappings, setFileMappings] = useState<{ blobURL: string; file: File }[]>([]);

  const [predictionResult, setPredictionResult] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false); // new state

  const next = () => setCurrent((prev) => prev + 1);
  const prev = () => setCurrent((prev) => prev - 1);

  const onChange = (value: number) => {
    console.log("Step changed:", value);
    setCurrent(value);
  };

  const handleFilesUploaded = (uploadedFiles: { blobURL: string; file: File }[]) => {
    setFiles(uploadedFiles);
    setPredictionResult(null);
    setPredictstep(1);
  };

  const handleFileMappingsUpdate = (newFileMappings: { blobURL: string; file: File }[]) => {
    setFileMappings(newFileMappings);
  };

  // useEffect(() => {
  //   console.log("📁 Updated files state:", files);
  // }, [files]);

  // Trigger prediction when settings change or files are uploaded
  useEffect(() => {
    setPredictionResult(null); // Clear previous results
    setPredictstep(1); // Reset button
    handlePrediction();
  }, [model, dataset, roi, voxelOption, voxelNumber, paper, participantName]);

  useEffect(() => {
    console.log("🔄 predictionResult updated:", predictionResult);
    if (predictionResult && current === 1) {
      setTimeout(() => {
        next(); // Automatically go to the next step
      }, 100); // 100ms delay
    }
  }, [predictionResult]);

  // ✅ Ensure only the actual file is sent to Gradio
  const handlePrediction = async () => {
    if (files.length === 0) {
      message.error("No files uploaded. Please upload files first.");
      return;
    }

    setPredictionLoading(true); // set true when prediction start
    try {
      console.log("📁 Sending files to Gradio:", files.map(f => handle_file(f.file)));

      const client = await Client.connect("http://127.0.0.1:7860/");

      const result = await client.predict("/predict", {
        images: files.map(f => handle_file(f.file)),
        roi: roi || "ffa",
        dataset: dataset || "murty185",
        backbone_name: model || "clip_rn50",
        rdm: true,
        mean: true,
        sem: true,
      });

      setPredictionResult(result.data);
      console.log("Full predictionResult:", JSON.stringify(result.data, null, 2));

      message.success("Prediction complete!");
    } catch (error) {
      message.error("Prediction failed. Check server connection.");
      console.error("Error in prediction:", error);
    }

    setPredictionLoading(false); // set false when prediction finish
    setLoading(false);
    setPredictstep(2);
  };

  const barchartData = useBarchartData(predictionResult);

  const { heatmapData, originalFilenames, sortedFilenames } = useHeatmapData(predictionResult);

  console.log("Extract Heatmap Data from predictionResult:", heatmapData);

  const contentStyle: React.CSSProperties = {
    lineHeight: '260px',
    textAlign: 'center',
    color: token.colorTextTertiary,
    backgroundColor: 'transparent',
    borderRadius: 0,
    border: 'none',
    marginTop: 16,
  };

  const downloadData = () => {
    if (predictionResult) {
      // Extract only the 'voxels' part of the prediction result
      const voxelsData = predictionResult[0]?.voxels; // Access the first element and then the voxels property

      if (voxelsData) {
        const jsonString = JSON.stringify(voxelsData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // Construct the filename using the state variables and a timestamp
        const timestamp = new Date().toISOString().replace(/[:\-T.]/g, ""); // Create a timestamp string
        const filename = `murtylab_${model}_${dataset}_${roi}_${timestamp}.json`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success("Voxels data downloading complete!");
      } else {
        message.error("No voxels data available to download.");
      }
    } else {
      message.error("No prediction result available to download.");
    }
  };

  const steps = [
    {
      title: 'Overall performance across all regions',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <ROISelect region={overall} setRegion={setOverall} dataset={dataset}/>
          <Settings
            model={model}
            setModel={setModel}
            dataset={dataset}
            setDataset={setDataset}
            voxelOption={voxelOption}
            setVoxelOption={setVoxelOption}
            voxelNumber={voxelNumber}
            setVoxelNumber={setVoxelNumber}
            participantName={participantName}
            setParticipantName={setParticipantName}
          />
          {predictionLoading && <LinearIndeterminate />}
        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title: 'A specific ROI',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <ROISelect region={roi} setRegion={setROI} dataset={dataset}/>
          <Settings
            model={model}
            setModel={setModel}
            dataset={dataset}
            setDataset={setDataset}
            voxelOption={voxelOption}
            setVoxelOption={setVoxelOption}
            voxelNumber={voxelNumber}
            setVoxelNumber={setVoxelNumber}
            participantName={participantName}
            setParticipantName={setParticipantName}
          />
          {predictionLoading && <LinearIndeterminate />}
        </div>
      ),
      icon: <SmileOutlined />,
    },
    {
      title: 'A specific Dataset',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <ROISelect region={roi} setRegion={setROI} dataset={dataset} />
          <ModelCard
            region={roi}
            dataset={dataset}
            model={model}
          />
          {predictionLoading && <LinearIndeterminate />} {/* add progress bar when predictionLoading is true */}
          <h3 style={{ textAlign: "left", color:"black", fontSize: "18px", marginBottom: "50px", marginTop: "40px"}}>Univariate Analysis: Predicted Mean response across one brain region for each image</h3>
          <BarChart barChartData={barchartData} height={600} fileMappings={fileMappings}/>
          <h3 style={{ textAlign: "left", color:"black", fontSize: "18px", marginBottom: "50px", marginTop: "40px"}}>Multivariate Analysis: Representation Dissimilarity Matrix(RDM) quantifies how different brain responses are among images</h3>
          <Heatmap heatmapData={heatmapData} originalFilenames={originalFilenames} sortedFilenames={sortedFilenames} width={800} height={800} fileMappings={fileMappings}/>
        </div>
      ),
      icon: <SmileOutlined />,
    },
  ];

  return (
    <>
      {/* <Steps 
        current={current} 
        onChange={onChange}
        progressDot
        status="process"
        responsive={false}
       >
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps> */}
      {/* <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
        {steps.map((item, index) => (
            <Button
            key={item.title}
            type={current === index ? 'primary' : 'default'}
            onClick={() => setCurrent(index)}
            style={{
                margin: '0 8px',
                fontWeight: current === index ? 'bold' : 'normal',
                backgroundColor: current === index ? '#1677ff' : '#f5f5f5',
                color: current === index ? 'white' : 'black',
                borderColor: current === index ? '#1677ff' : '#d9d9d9',
                borderRadius: 20,
            }}
            >
            {item.title}
            </Button>
        ))}
        </div> */}
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

      <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: "8px" }}>

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
      </div>
    </>
  );
};

export default ScoreboardPage;
