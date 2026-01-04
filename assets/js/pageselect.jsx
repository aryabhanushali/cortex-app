// pageselect.jsx
import React from 'react';
import { Radio } from 'antd';
import { PAGE_VIEW_OPTIONS } from './constants-scoreboard';

const PageSelect = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <Radio.Group 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        buttonStyle="solid"
        style={{ width: '100%', display: 'flex' }}
      >
        {PAGE_VIEW_OPTIONS.map(opt => (
          <Radio.Button 
            key={opt.value} 
            value={opt.value} 
            style={{ 
              flex: 1, 
              textAlign: 'center',
              fontWeight: 500
            }}
          >
            {opt.label}
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  );
};

export default PageSelect;