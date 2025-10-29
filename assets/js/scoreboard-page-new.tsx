import React, { useState } from 'react';
import { Typography, Button } from 'antd';

import TrainingSelectNew from './trainingselectnew.jsx';
import ROISelectNew from './roiselectnew.jsx';
import DatasetSelectNew from './datasetselectnew.jsx';
import SelectedFiltersBar from './selectFiltersBar.jsx';
import ChartSelect from './chartselect.jsx'; 
import HeatmapOverview from './heatmapOverview.jsx';
import HeatmapDetail from './heatmapDetail.jsx';



import useLoadDataNew from './loadDataNew.jsx';

const { Title } = Typography;

const ScoreboardPageNew: React.FC = () => {
  const [training, setTraining] = useState('NSD');
  const [region, setRegion] = useState([]);
  const [dataset, setDataset] = useState([]);

  const [chartType, setChartType] = useState('uni'); 
  const [rank, setRank] = useState(''); 
  const [selectedModel, setSelectedModel] = useState<string | null>(null);



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
  
  


  const hasFilters =
    (training && training !== '') ||
    (Array.isArray(dataset) && dataset.length > 0) ||
    (Array.isArray(region) && region.length > 0);

  const clearFilters = () => {
    setTraining('');
    setRegion([]);
    setDataset([]);
  };

  const clearSingle = (key: string, value: string) => {
    if (key === 'training') setTraining('');
    if (key === 'dataset') setDataset((prev) => prev.filter((r) => r !== value));
    if (key === 'region') setRegion((prev) => prev.filter((r) => r !== value));
  };

  const getDataByTraining = (training: string) => {
  if (training === "NSD") {
    return  nsdData;
  } else if (training === "Murty185") {
    return murtyData;
  } else {
    return {}; 
  }
};

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 7fr', // 左侧 filters + 右侧整体
        gap: 16,
        padding: 0,
        alignItems: 'start',
      }}
    >
      {/* 顶部过滤标签栏 */}
      <div style={{ gridColumn: '1 / -1', marginBottom: 8 }}>
        <SelectedFiltersBar
          training={training}
          region={region}
          dataset={dataset}
          clearSingle={clearSingle}
        />
      </div>

      {/* 左侧 Filters */}
      <div
        style={{
          height: 'calc(100vh - 200px)',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
          padding: '4px 0px',
          scrollbarWidth: 'thin',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4} style={{ marginBottom: 0 }}>
            Filters
          </Title>
          <Button
            type="default"
            disabled={!hasFilters}
            onClick={clearFilters}
            style={{
              borderRadius: 6,
              fontWeight: 500,
              color: hasFilters ? '#1890ff' : '#aaa',
              borderColor: hasFilters ? '#1890ff' : '#ccc',
            }}
          >
            Clear Filters
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          <TrainingSelectNew training={training} setTraining={setTraining} dataset={dataset} />
          <DatasetSelectNew
            dataset={dataset}
            setDataset={setDataset}
            training={training}
            region={region}
            allowToggle={true}
            mode={1}
          />
          <ROISelectNew
            region={region}
            setRegion={setRegion}
            dataset={dataset}
            setDataset={setDataset}
            allowToggle={true}
            mode={1}
            training={training}
          />
        </div>
      </div>

      {/* 右侧整体（中 + 右） */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 200px)',
          gap: 16,
        }}
      >
        {/* ✅ 顶部 ChartSelect 组件 */}
        <div
          style={{
            background: '#f5f5f5',
            borderRadius: 8,
            padding: '0px 0px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ChartSelect
            chartType={chartType}
            setChartType={setChartType}
            rank={rank}
            setRank={setRank}
            enable={true} 
          />
        </div>

    
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 5.5fr', gap: 16, flex: 1 }}>
          <div
            style={{
              background: '#fafafa',
              borderRadius: 8,
              padding: 8,
              overflow: 'hidden',
            }}

            
          >
             <HeatmapOverview
              data={getDataByTraining(training)} 
              roi={'Overall'}
              dataset={dataset[0] || ''}
              rank={rank}
              onModelClick={(m: string) => setSelectedModel(m)}
            />
          </div>

         <div
          style={{
            background: '#fafafa',
            borderRadius: 8,
            padding: 16,
            
                 // ✅ 内容居中
          }}
        >
          {/* === Title === */}
          <h3
            style={{
              marginBottom: 8,
              fontSize: '18px',
              fontWeight: 600,
              color: '#333',
               textAlign: 'center', 
            }}
          >
            {`Across-ROIs Performance (Trained on ${
              training === 'NSD' ? 'NSD1000' : 'Murty185'
            })`}
          </h3>

          {/* === Heatmap === */}
          
           <div
            style={{
              background: "#fafafa",
              borderRadius: 8,
              overflowX: "auto", // ✅ 可以水平滚动
              justifyContent: "flex-start", // ✅ 改成左对齐
              alignItems: "flex-start",
              // marginLeft: "auto",
              // marginRight: "auto",  
            }}
          >
            <HeatmapDetail
              data={getDataByTraining(training)} 
              roi={'Overall'}
              dataset={dataset[0] || ''}
              rank={rank}
              onModelClick={(m: string) => setSelectedModel(m)}
            />
          </div>
        </div>

        </div>
      </div>
    </div>
  );
};

export default ScoreboardPageNew;
