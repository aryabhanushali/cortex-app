import React from 'react';
import { Select, Typography } from 'antd';
import { ADVANCED_QUESTION } from './constants-scoreboard';

const { Text } = Typography;

const QuestionSelect = ({ value, onChange }) => {
  return (
    <div
      style={{
        flex: '0 0 auto', 
        background: '#f5f5f5',
        borderRadius: 8,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: 8 // gap
      }}
    >
      <Text strong style={{ color: '#555', fontSize: '14px', whiteSpace: 'nowrap' }}>
        Insight Question:
      </Text>
      
      <Select
        value={value}
        onChange={onChange}
        placeholder="Select a question to analyze"
        style={{ width: '400px' }} 
        bordered={false} 
        dropdownStyle={{ borderRadius: 8 }}
        options={ADVANCED_QUESTION}
      />
    </div>
  );
};

export default QuestionSelect;