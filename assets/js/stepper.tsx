import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Button, message, Steps, theme } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import { uploadImages } from './services/imageUploader.js';
import { SERVER_URL } from './services/config';
import { ConfigProvider } from 'antd'; 

//main component
import LinearIndeterminate from './Lab/linearprogessor.jsx';
import Uploader from './Lab/uploader.tsx';
import RegionSelector from './Lab/regionselector.jsx';
import Settings from './Lab/settings.jsx';
import ModelCard from './Lab/modelcard.jsx';
// import PaperSelector from './paperselector.jsx'; 
// visualization graphics
import BarChart from './Lab/barchart.jsx';
import Heatmap from './Lab/heatmap.jsx';
import ImagePreviewGroupedDnD from './Lab/imagePreviewGrid.jsx';


const { Step } = Steps;
const SERVER_BASE_URL = SERVER_URL;

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

const Stepper: React.FC = () => {
  const { token } = theme.useToken();
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

  const [uploaderKey, setUploaderKey] = useState(0);

  // const [files, setFiles] = useState<{ blobURL: string; file: File }[]>([]);
  // const [fileMappings, setFileMappings] = useState<{ blobURL: string; file: File }[]>([]);
  const [files, setFiles] = useState<{ uid: string; blobURL: string; file: File }[]>([]);
  const [fileMappings, setFileMappings] = useState<{ uid: string; blobURL: string; file: File }[]>([]);

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
    // setFiles(uploadedFiles);
    const withUid = uploadedFiles.map((f) => ({
      ...f,
      uid: (globalThis.crypto?.randomUUID?.() ?? `${f.file.name}-${f.file.size}-${f.file.lastModified}-${Math.random()}`)
    }));
    setFiles(withUid);
    setPredictionResult(null);
    setPredictstep(1);
  };

  const handleFileMappingsUpdate = (newFileMappings: { blobURL: string; file: File }[]) => {
    // setFileMappings(newFileMappings);
     const withUid = newFileMappings.map((f) => ({
        ...f,
        uid: (globalThis.crypto?.randomUUID?.() ?? `${f.file.name}-${f.file.size}-${f.file.lastModified}-${Math.random()}`)
        }));
        setFileMappings(withUid);
      };

  // ✅ stable key (must match uploader's fileKey)
const fileKey = (f: File) => {
  const rel = (f as any).webkitRelativePath || "";
  return `${rel}::${f.name}::${f.size}::${f.lastModified}`;
};

// ✅ addIncomingFiles 保持你的版本即可（我只加了 try/catch 保险）
const addIncomingFiles = (newFiles: File[]) => {
  if (!newFiles?.length) return;

  setFiles((prev) => {
    const existing = new Set(prev.map((x) => x.uid));

    const nextAdd = newFiles
      .filter((f) => f.type?.startsWith("image/"))
      .map((f) => {
        const uid = fileKey(f);
        return { uid, file: f, blobURL: URL.createObjectURL(f) };
      })
      .filter((x) => !existing.has(x.uid));

    if (!nextAdd.length) return prev;

    const next = [...prev, ...nextAdd];
    setFileMappings(next);
    setPredictionResult(null);
    setPredictstep(1);

    return next;
  });
};

// ✅ 单个删除：一定要 revoke + 同步 fileMappings + 如果删空就 reset uploader
const removeOne = (uid: string) => {
  setFiles((prev) => {
    const target = prev.find((x) => x.uid === uid);
    if (target) {
      try { URL.revokeObjectURL(target.blobURL); } catch {}
    }

    const next = prev.filter((x) => x.uid !== uid);

    setFileMappings(next);
    setPredictionResult(null);
    setPredictstep(1);

    if (next.length === 0) {
      setUploaderKey((k) => k + 1); // ✅ 删空了就重置 uploader 内部状态
    }

    return next;
  });
};

// ✅ 清一个 group：revoke 所有被删的 blobURL；如果删空就 reset uploader
const clearGroup = (uidsToRemove: string[]) => {
  const removeSet = new Set(uidsToRemove);

  setFiles((prev) => {
    prev.forEach((x) => {
      if (removeSet.has(x.uid)) {
        try { URL.revokeObjectURL(x.blobURL); } catch {}
      }
    });

    const next = prev.filter((x) => !removeSet.has(x.uid));

    setFileMappings(next);
    setPredictionResult(null);
    setPredictstep(1);

    if (next.length === 0) {
      setUploaderKey((k) => k + 1); // ✅ 删空了就重置 uploader
    }

    return next;
  });
};

// ✅ clear all：revoke 全部 + 清空 + reset uploader
const clearAll = () => {
  setFiles((prev) => {
    prev.forEach((x) => {
      try { URL.revokeObjectURL(x.blobURL); } catch {}
    });
    return [];
  });

  setFileMappings([]);
  setPredictionResult(null);
  setPredictstep(1);
  setUploaderKey((k) => k + 1); // ✅ 不管怎样都重置
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

  // ✅ Ensure only the actual file is sent to Gradio
  const handlePrediction = async () => {
    if (files.length === 0) {
      message.error("No files uploaded. Please upload files first.");
      return;
    }

    setPredictionLoading(true); // set true when prediction start
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

  // const contentStyle: React.CSSProperties = {
  //   lineHeight: '260px',
  //   textAlign: 'center',
  //   color: token.colorTextTertiary,
  //   backgroundColor: 'transparent',
  //   borderRadius: 0,
  //   border: 'none',
  //   marginTop: 16,
  // };
  const contentStyle: React.CSSProperties = {
    textAlign: 'center',
    color: token.colorTextTertiary,
    backgroundColor: 'transparent',
    borderRadius: 0,
    border: 'none',
    marginTop: 16,
    padding: 0,
  };

  //support csv download
  const downloadData = () => {
    if (predictionResult) {
      const voxelsData = predictionResult[0]?.voxels;
  
      if (voxelsData && typeof voxelsData === "object") {
        const csvRows = [];
  
        // Step 1: Collect all headers dynamically
        const headers = new Set();
        const imageRows = [];
  
        for (const [imageName, subjects] of Object.entries(voxelsData)) {
          const row = { image: imageName };
  
          for (const [subject, regions] of Object.entries(subjects)) {
            for (const [regionName, voxelArray] of Object.entries(regions)) {
              voxelArray.forEach((val, i) => {
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
          const values = orderedHeaders.map(h => row[h] ?? "");
          csvRows.push(values.join(","));
        });
  
        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
  
        const timestamp = new Date().toISOString().replace(/[:\-T.]/g, "");
        const filename = `murtylab_${model}_${dataset}_${region}_${timestamp}.csv`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        message.success("Voxels data downloaded as CSV!");
      } else {
        message.error("No voxels data available to download.");
      }
    } else {
      message.error("No prediction result available to download.");
    }
  };

  const getGroupKey = (file) => {
          const rel = file?.webkitRelativePath || "";
          if (!rel) return "Ungrouped";
          const parts = rel.split("/").filter(Boolean);
          // groupDepth=1: inputFolder / subfolder / filename  -> subfolder
          return parts[1] || "Ungrouped";
        };
  
  const steps = [
    {
      title: 'Upload Stimuli',
      // content: <Uploader onFilesUploaded={handleFilesUploaded} onFileMappingsUpdate={handleFileMappingsUpdate} />,
          content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Uploader  key={uploaderKey} onAddFiles={(newFiles) => addIncomingFiles(newFiles)} />

        

          <ImagePreviewGroupedDnD
            files={files}
            title="Uploaded Images Preview (Grouped)"
            groupDepth={1}
            showPathDebug={false}
            onRemove={(uid) => removeOne(uid)}
            onClear={() => clearAll()}
            onClearGroup={(groupKey, uidsToRemove) => clearGroup(uidsToRemove)}
            onGroupOrderChange={(order) => console.log("Group order:", order)}
          />

          <div style={{ textAlign: 'right', color: 'black', fontWeight: 500 }}>
            📸 {files.length} images uploaded
          </div>
        </div>
      ),
    },
    {
      title: 'Training Settings',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px'}}>
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
          {predictionLoading && <LinearIndeterminate />}
        </div>
      ),
    },
    {
      title: 'Prediction Results',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column'}}>
          <RegionSelector region={region} setRegion={setRegion} dataset={dataset} />
          <ModelCard
            region={region}
            dataset={dataset}
            model={model}
          />
          {predictionLoading && <LinearIndeterminate />} {/* add progress bar when predictionLoading is true */}
            <h3 style={{ textAlign: "left", color:"black", fontSize: "18px", marginBottom: "50px", marginTop: "40px"}}>
            <b>Univariate Analysis:</b> Predicted voxel average responses
            </h3>
          <BarChart barChartData={barchartData} height={600} fileMappings={fileMappings}/>
            <h3 style={{ textAlign: "left", color:"black", fontSize: "18px", marginBottom: "50px", marginTop: "40px"}}><b>Multivariate Analysis:</b> Respresentational dissimilarity matrix (RDM) from predicted voxel responses</h3>
          {/* <Heatmap heatmapData={heatmapData} originalFilenames={originalFilenames} sortedFilenames={sortedFilenames} width={800} height={800} fileMappings={fileMappings}/> */}
          {barchartData.length <= 1 ? (
            <div style={{ textAlign: 'center', fontSize: '16px', color: '#888', fontStyle: 'italic' }}>
              RDM unavailable for one image. Please upload more than 2 images to see the visualization.
            </div>
          ) : (
            <Heatmap heatmapData={heatmapData} originalFilenames={originalFilenames} sortedFilenames={sortedFilenames} width={800} height={800} fileMappings={fileMappings}
            />
          )}
        </div>
      ),
      icon: <SmileOutlined />,
    },
  ];

 return (
  <>
    <ConfigProvider
      theme={{
        components: {
          Steps: {
            colorPrimary: "var(--tungsten)", // Customize the primary color for Steps
          },
          Button: {
            colorPrimary: "var(--tungsten)",                 // 正常状态
            colorPrimaryHover: "var(--highlight-color-button)", // hover
            colorPrimaryActive: "var(--highlight-color-button)", // 点击时
          },
           Progress: {
            colorPrimary: "var(--highlight-color-button)",
          },
        },
      }}
    >
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
          <Button type="primary" onClick={downloadData} disabled={!predictionResult}>
            Download Data
          </Button>
        )}
      </div>
    </ConfigProvider>
  </>
);
};

export default Stepper;
