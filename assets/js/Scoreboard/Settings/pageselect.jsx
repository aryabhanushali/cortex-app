// pageselect.jsx
import React from 'react';
import { Radio } from 'antd';
import { PAGE_VIEW_OPTIONS } from '../../constants-scoreboard';

const PageSelect = ({ value, onChange }) => {
  return (
    <div style={{ marginBottom: 16 }}>
      <Radio.Group 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        buttonStyle="solid"
        style={{ display: 'inline-flex', whiteSpace: 'nowrap' }}
      >
        {PAGE_VIEW_OPTIONS.map(opt => (
          <Radio.Button 
            key={opt.value} 
            value={opt.value} 
            style={{ 
            //   flex: 1, 
              padding: '0 16px',
              textAlign: 'center',
              fontWeight: 500,
              height: '32px',
              lineHeight: '30px',
              fontSize: '13px'
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