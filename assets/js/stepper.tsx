import React, { useState, useEffect } from 'react';
import { Button, message, Steps, theme } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import Uploader from './uploader.tsx';
import BarChart from './barchart.jsx';
import useBarchartData from './useBarchartData.jsx';
import useHeatmapData from './useHeatmapData.jsx';
import Settings from './settings.jsx';
import Heatmap from './heatmap.jsx';
import { Client } from "@gradio/client";


const { Step } = Steps;

const Stepper: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);

  const DEFAULT_REGION = "ffa";
  const DEFAULT_MODEL = "clip_rn50";
  const DEFAULT_DATASET = "murty185";
  const DEFAULT_VOXEL = "all-participants";

  const [model, setModel] = useState(DEFAULT_MODEL);
  const [dataset, setDataset] = useState(DEFAULT_DATASET);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [voxelOption, setVoxelOption] = useState(DEFAULT_VOXEL);
  const [voxelNumber, setVoxelNumber] = useState("");
  const [paper, setPaper] = useState("");
  const [participantName, setParticipantName] = useState("");

  // Store both blob and actual file path
  const [files, setFiles] = useState<{ blobURL: string; file: File }[]>([]);
  const [predictionResult, setPredictionResult] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const next = () => setCurrent((prev) => prev + 1);
  const prev = () => setCurrent((prev) => prev - 1);

  const onChange = (value: number) => {
    console.log("Step changed:", value);
    setCurrent(value);
  };

  // ✅ Update this function to handle the correct file structure
  const handleFilesUploaded = (uploadedFiles: { blobURL: string; file: File }[]) => {
    setFiles(uploadedFiles);
  };

  useEffect(() => {
    console.log("📁 Updated files state:", files);
  }, [files]);

  // ✅ Ensure only the actual file is sent to Gradio
  const handlePrediction = async () => {
    if (files.length === 0) {
      message.error("No files uploaded. Please upload files first.");
      return;
    }

    setLoading(true);

    try {
      console.log("📁 Sending files to Gradio:", files.map(f => f.file));

      const client = await Client.connect("http://127.0.0.1:7860/");
      const result = await client.predict("/predict", {
        images: files.map(f => f.file), // Send only File objects, not blobs
        roi: region || "ffa",
        dataset: dataset || "murty185",
      });

      setPredictionResult(result.data);
      message.success("Prediction complete!");
    } catch (error) {
      message.error("Prediction failed. Check server connection.");
      console.error("Error in prediction:", error);
    }

    setLoading(false);
  };
  


  const { barchartData } = useBarchartData();
  const { heatmapData, originalFilenames, sortedFilenames } = useHeatmapData();

  const contentStyle: React.CSSProperties = {
    lineHeight: '260px',
    textAlign: 'center',
    color: token.colorTextTertiary,
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };

  const steps = [
    {
      title: 'Upload Stimuli',
      content: <Uploader onFilesUploaded={handleFilesUploaded} />,
    },
    {
      title: 'Training Settings',
      content: (
        <Settings
          region={region}
          setRegion={setRegion}
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
          paper={paper}
          setPaper={setPaper}
        />
      ),
    },
    {
      title: 'Prediction Results',
      content: (
        <div>
          <BarChart barChartData={barchartData} height={500}/>
          <Heatmap heatmapData={heatmapData} originalFilenames={originalFilenames} sortedFilenames={sortedFilenames} width={1000} height={1000} />
          {predictionResult && <pre>{JSON.stringify(predictionResult, null, 2)}</pre>}
        </div>
      ),
      icon: <SmileOutlined />,
    },
  ];

  return (
    <>
      <Steps current={current} onChange={onChange}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} />
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
            {loading ? "Uploading..." : "Next"}
          </Button>
        )}

        {current === 1 && (
          <Button 
            type="primary" 
            onClick={handlePrediction} 
            disabled={loading || files.length === 0}
          >
            {loading ? "Processing..." : "Predict"}
          </Button>
        )}

        {current === steps.length - 1 && (
          <Button 
            type="primary" 
            onClick={() => message.success("Processing complete!")}
          >
            Download Data
          </Button>
        )}
      </div>
    </>
  );
};

export default Stepper;
