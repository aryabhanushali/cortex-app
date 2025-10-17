import React, { useState } from 'react';
import { Typography, Button } from 'antd';

import TrainingSelectNew from './trainingselectnew.jsx';
import ROISelectNew from './roiselectnew.jsx';
import DatasetSelectNew from './datasetselectnew.jsx';
import SelectedFiltersBar from './selectFiltersBar.jsx'; 

const { Title } = Typography;

const ScoreboardPageNew: React.FC = (
) => {
  const [training, setTraining] = useState('');
  const [region, setRegion] = useState([]);
  const [dataset, setDataset] =  useState([]);

 const hasFilters =
  (training && training !== '') ||
  (Array.isArray(dataset) && dataset.length > 0) ||
  (Array.isArray(region) && region.length > 0);


  const clearFilters = () => {
    setTraining('');
    setRegion([]); 
    setDataset([]);
  };

  const clearSingle = (key: String, value: String) => {
  if (key === 'training') setTraining('');
  if (key === 'dataset') {
    setDataset((prev) => prev.filter((r) => r !== value));
  }
  if (key === 'region') {
    setRegion((prev) => prev.filter((r) => r !== value));
  }
};
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 3fr 4fr',
        gap: 16,
        padding: 24,
        alignItems: 'start',
      }}
    >
      <div
        style={{
          gridColumn: '1 / -1',
          marginBottom: 8,
        }}
      >
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
          height: 'calc(100vh - 160px)',  // ✅ 减去顶部 header 高度
          overflowY: 'auto',
          minHeight: '40vh',
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

      {/* 中间区域 */}
      <div
        style={{
          minHeight: '80vh',
          background: '#fafafa',
          borderRadius: 8,
          padding: 16,
        }}
      >
        <Title level={4}>Center Section</Title>
      </div>

      {/* 右侧区域 */}
      <div
        style={{
          minHeight: '80vh',
          background: '#fafafa',
          borderRadius: 8,
          padding: 16,
        }}
      >
        <Title level={4}>Controls</Title>
      </div>
    </div>
  );
};

export default ScoreboardPageNew;
