'use client'
import React, { useState, useEffect } from 'react';
import Uploader from './uploader';
import BarChart from './barchart.jsx';
import Settings from './settings.jsx';
import Heatmap from './heatmap.jsx';
import { useMemo } from "react";
import axios from 'axios';

import RegionSelector from './regionselector.jsx';
import ModelCard from './modelcard.jsx';
import LinearIndeterminate from './linearprogessor.jsx';
import { uploadImages } from './services/imageUploader.js';
import { SERVER_URL } from './services/config';

const SERVER_BASE_URL = SERVER_URL;

// Custom hooks for data processing
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
    const heatmapData = rdm.flatMap((row: any[], i: number) =>
      row.map((value: any, j: number) => ({
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

// Component for the upload step
const UploadStep = ({ files, onFilesUploaded, onFileMappingsUpdate }) => {
  return (
    <div className="card shadow-sm border-0 p-4">
      <div className="card-body">
        <h4 className="card-title mb-4">Upload Your Stimuli</h4>
        <Uploader onFilesUploaded={onFilesUploaded} onFileMappingsUpdate={onFileMappingsUpdate} />
        <div className="text-end mt-3 text-muted">
          <span className="badge bg-primary rounded-pill">
            <i className="bi bi-image me-1"></i> {files.length} images uploaded
          </span>
        </div>
      </div>
    </div>
  );
};

// Component for the settings step
const SettingsStep = ({ 
  region, setRegion, dataset, model, setModel, setDataset, 
  voxelOption, setVoxelOption, voxelNumber, setVoxelNumber, 
  participantName, setParticipantName, predictionLoading 
}) => {
  return (
    <div className="card shadow-sm border-0 p-4">
      <div className="card-body">
        <h4 className="card-title mb-4">Configure Analysis Settings</h4>
        <RegionSelector region={region} setRegion={setRegion} dataset={dataset}/>
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
        {predictionLoading && (
          <div className="mt-4">
            <p className="text-primary mb-2">Processing your images...</p>
            <LinearIndeterminate />
          </div>
        )}
      </div>
    </div>
  );
};

// Component for the results step
const ResultsStep = ({ 
  region, setRegion, dataset, model, barchartData, 
  heatmapData, originalFilenames, sortedFilenames, 
  fileMappings, predictionLoading 
}) => {
  return (
    <div className="card shadow-sm border-0 p-4">
      <div className="card-body">
        <h4 className="card-title mb-4">Analysis Results</h4>
        
        <div className="mb-4">
          <RegionSelector region={region} setRegion={setRegion} dataset={dataset} />
        </div>
        
        <ModelCard region={region} dataset={dataset} model={model} />
        
        {predictionLoading && (
          <div className="my-4">
            <p className="text-primary mb-2">Updating results...</p>
            <LinearIndeterminate />
          </div>
        )}
        
        <div className="mt-5">
          <h5 className="fw-bold border-start border-4 border-primary ps-3 mb-4">
            Univariate Analysis: Predicted voxel average responses
          </h5>
          <div className="chart-container">
            <BarChart barChartData={barchartData} height={600} fileMappings={fileMappings}/>
          </div>
        </div>
        
        <div className="mt-5">
          <h5 className="fw-bold border-start border-4 border-primary ps-3 mb-4">
            Multivariate Analysis: Representational dissimilarity matrix (RDM)
          </h5>
          {barchartData.length <= 1 ? (
            <div className="alert alert-info">
              <i className="bi bi-info-circle me-2"></i>
              RDM unavailable for one image. Please upload more than 2 images to see the visualization.
            </div>
          ) : (
            <div className="chart-container">
              <Heatmap 
                heatmapData={heatmapData} 
                originalFilenames={originalFilenames} 
                sortedFilenames={sortedFilenames} 
                width={800} 
                height={800} 
                fileMappings={fileMappings}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// CSV data download utility
const useDataDownloader = (predictionResult) => {
  return () => {
    if (predictionResult) {
      const voxelsData = predictionResult[0]?.voxels;
  
      if (voxelsData && typeof voxelsData === "object") {
        const csvRows = [];
  
        // Step 1: Collect all headers dynamically
        const headers = new Set<string>();
        const imageRows: Array<Record<string, any>> = [];
  
        for (const [imageName, subjects] of Object.entries(voxelsData as Record<string, any>)) {
          const row: Record<string, any> = { image: imageName };
  
          for (const [subject, regions] of Object.entries(subjects as Record<string, any>)) {
            for (const [regionName, voxelArray] of Object.entries(regions as Record<string, any>)) {
              (voxelArray as any[]).forEach((val: any, i: number) => {
                const key = `${subject}_${i}`;
                row[key] = val;
                headers.add(key);
              });
            }
          }
  
          imageRows.push(row);
        }
  
        const orderedHeaders = ["image", ...Array.from(headers)];
        csvRows.push(orderedHeaders.join(","));
  
        // Step 2: Write rows based on headers
        imageRows.forEach(row => {
          const values = orderedHeaders.map(h => (h in row ? row[h] : ""));
          csvRows.push(values.join(","));
        });
  
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
  
        const timestamp = new Date().toISOString().replace(/[:\-T.]/g, "");
        const filename = `murtylab_${predictionResult[0]?.model || 'model'}_${predictionResult[0]?.dataset || 'dataset'}_${predictionResult[0]?.region || 'region'}_${timestamp}.csv`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert("Voxels data downloaded as CSV!");
      } else {
        alert("No voxels data available to download.");
      }
    } else {
      alert("No prediction result available to download.");
    }
  };
};

// Main Stepper component
const Stepper: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [predictstep, setPredictstep] = useState(1);

  const DEFAULT_REGION = "ffa";
  const DEFAULT_MODEL = "clip_rn50";
  const DEFAULT_DATASET = "nsd_1000";
  const DEFAULT_VOXEL = "all-participants";

  const [model, setModel] = useState(DEFAULT_MODEL);
  const [dataset, setDataset] = useState(DEFAULT_DATASET);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [voxelOption, setVoxelOption] = useState(DEFAULT_VOXEL);
  const [voxelNumber, setVoxelNumber] = useState("");
  const [paper, setPaper] = useState("");
  const [participantName, setParticipantName] = useState("");

  const [files, setFiles] = useState<{ blobURL: string; file: File }[]>([]);
  const [fileMappings, setFileMappings] = useState<{ blobURL: string; file: File }[]>([]);

  const [predictionResult, setPredictionResult] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);

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

  useEffect(() => {
    // Only auto-trigger prediction if we're on Step 3 (index 2)
    if (current === 2) {
      setPredictionResult(null);
      setPredictstep(1);
      handlePrediction();
    }
  }, [region]); // Only watch region

  useEffect(() => {
    console.log("🔄 predictionResult updated:", predictionResult);
    if (predictionResult && current === 1) {
      setTimeout(() => {
        next(); // Automatically go to the next step
      }, 100); // 100ms delay
    }
  }, [predictionResult]);

  // Handle prediction logic
  const handlePrediction = async () => {
    if (files.length === 0) {
      alert("No files uploaded. Please upload files first.");
      return;
    }

    setPredictionLoading(true);
    try {
      // Upload images to the server
      const uploadResult = await uploadImages(files.map(f => f.file));
      
      // predict via http method
      const result = await axios.post(`${SERVER_BASE_URL}/api/predict`, {
        data: [
          uploadResult.map((f: string) => ({ path: `${f}`, org_name: f.split('/').pop() })),
          region || "ffa",
          dataset || "murty185",
          model || "clip_rn50",
          true, // rdm
          true, // mean
          true, // sem
        ],
      });

      setPredictionResult(result.data.data);
      console.log("Full predictionResult:", JSON.stringify(result.data, null, 2));

      alert("Prediction complete!");
    } catch (error) {
      alert("Prediction failed. Check server connection.");
      console.error("Error in prediction:", error);
    }

    setPredictionLoading(false);
    setLoading(false);
    setPredictstep(2);
  };

  const barchartData = useBarchartData(predictionResult);
  const { heatmapData, originalFilenames, sortedFilenames } = useHeatmapData(predictionResult);
  const downloadData = useDataDownloader(predictionResult);

  const steps = [
    {
      title: 'Upload Stimuli',
      content: (
        <UploadStep 
          files={files} 
          onFilesUploaded={handleFilesUploaded} 
          onFileMappingsUpdate={handleFileMappingsUpdate} 
        />
      ),
    },
    {
      title: 'Training Settings',
      content: (
        <SettingsStep 
          region={region}
          setRegion={setRegion}
          dataset={dataset}
          model={model}
          setModel={setModel}
          setDataset={setDataset}
          voxelOption={voxelOption}
          setVoxelOption={setVoxelOption}
          voxelNumber={voxelNumber}
          setVoxelNumber={setVoxelNumber}
          participantName={participantName}
          setParticipantName={setParticipantName}
          predictionLoading={predictionLoading}
        />
      ),
    },
    {
      title: 'Prediction Results',
      content: (
        <ResultsStep 
          region={region}
          setRegion={setRegion}
          dataset={dataset}
          model={model}
          barchartData={barchartData}
          heatmapData={heatmapData}
          originalFilenames={originalFilenames}
          sortedFilenames={sortedFilenames}
          fileMappings={fileMappings}
          predictionLoading={predictionLoading}
        />
      ),
    },
  ];

  return (
    <div className="stepper-container">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center position-relative">
          {/* Progress line */}
          <div className="position-absolute" style={{ 
            height: '2px', 
            backgroundColor: '#e9ecef', 
            width: '100%', 
            top: '16px', 
            zIndex: 0 
          }}></div>
          <div className="position-absolute" style={{ 
            height: '2px', 
            backgroundColor: '#0d6efd', 
            width: `${(current / (steps.length - 1)) * 100}%`, 
            top: '16px', 
            zIndex: 1,
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
          }}></div>
          
          {/* Step indicators */}
          {steps.map((step, index) => (
            <div key={index} className="text-center position-relative" style={{ zIndex: 2 }}>
              <button 
                className={`btn rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm ${
                  current > index 
                    ? 'btn-success text-white' 
                    : current === index 
                      ? 'btn-primary text-white' 
                      : 'btn-light'
                }`}
                style={{ 
                  width: '32px', 
                  height: '32px', 
                  margin: '0 auto',
                  transition: 'all 0.3s ease'
                }}
                onClick={() => onChange(index)}
              >
                {current > index ? <i className="bi bi-check-lg"></i> : index + 1}
              </button>
              <span className={`d-block mt-2 small ${current === index ? 'fw-bold' : 'text-muted'}`}
                    style={{ fontSize: '0.75rem' }}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="step-content my-4">{steps[current].content}</div>

      <div className="d-flex justify-content-between mt-4">
        {current > 0 ? (
          <button
            className="btn btn-sm btn-outline-secondary rounded-pill px-3"
            onClick={prev}
            disabled={loading}
          >
            <i className="bi bi-arrow-left me-1"></i>
            Back
          </button>
        ) : (
          <div></div> // Empty div to maintain flex spacing
        )}

        <div>
          {current === 0 && (
            <button
              className="btn btn-sm btn-primary rounded-pill px-3"
              onClick={() => {
                if (files.length > 0) {
                  next();
                } else {
                  alert("Please upload at least one image to continue.");
                }
              }}
              disabled={loading || files.length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  <span className="small">Uploading</span>
                </>
              ) : (
                <>
                  <span className="small">Next</span>
                  <i className="bi bi-arrow-right ms-1"></i>
                </>
              )}
            </button>
          )}

          {current === 1 && (
            <button
              className="btn btn-sm btn-primary rounded-pill px-3"
              onClick={() => {
                predictstep === 1 ? handlePrediction() : next();
              }}
              disabled={loading || files.length === 0 || predictionLoading}
            >
              {predictionLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  <span className="small">Processing</span>
                </>
              ) : (
                <>
                  <span className="small">Results</span>
                  <i className="bi bi-arrow-right ms-1"></i>
                </>
              )}
            </button>
          )}

          {current === steps.length - 1 && (
            <button
              className="btn btn-sm btn-success rounded-pill px-3"
              onClick={downloadData}
              disabled={!predictionResult}
            >
              <i className="bi bi-download me-1"></i>
              <span className="small">Download</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Stepper;
