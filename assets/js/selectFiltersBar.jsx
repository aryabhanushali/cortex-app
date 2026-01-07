import React from 'react';
import { Tag } from 'antd';

const SelectedFiltersBar = ({ training, region, dataset, clearSingle }) => {
  const selected = [];

  // order: training region dataset
  if (training) selected.push({ key: 'training', label: training, color: '#b8c4de' });

  if (Array.isArray(region) && region.length > 0) {
    region.forEach((r) => {
      selected.push({ key: `region-${r}`, label: r.toUpperCase(), color: '#e5cf98' });
    });
  }

  if (Array.isArray(dataset) && dataset.length > 0) {
    dataset.forEach((r) => {
      selected.push({ key: `dataset-${r}`, label: r.toUpperCase(), color: '#9bbfc4ff' });
    });
  }
 


  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0,
        padding: '0',
        minHeight: 30, 
        alignItems: 'center',
      }}
    >
      {selected.map((item) => (
        <Tag
          key={item.key}
          color={item.color}
          closable
          onClose={() => {
            // region/ dataset support single remove
            if (item.key.startsWith('region-')) {
              const r = item.key.replace('region-', '');
              clearSingle('region', r);
            } 
            else if (item.key.startsWith('dataset-')) {
              const r = item.key.replace('dataset-', '');
              clearSingle('dataset', r);
            } else {
              clearSingle(item.key);
            }
          }}
          style={{
            borderRadius: 20,
            padding: '4px 12px',
            fontWeight: 500,
            fontSize: '0.95em',
          }}
        >
          {item.label}
        </Tag>
      ))}
    </div>
  );
};

export default SelectedFiltersBar;
