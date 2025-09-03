// chartselect.jsx
import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { CHART_TYPE_OPTIONS, RANK } from './constants-scoreboard';

const ChartSelect = ({ chartType, setChartType, rank, setRank, enable }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center",gap: 10 }}>
      {/* 第一组：Uni vs Multi */}
      <ButtonGroup>
        {CHART_TYPE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => setChartType(option.value)}
            variant={chartType === option.value ? "contained" : "outlined"}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>

      {/* 第二组：All vs Top10 */}
      {enable &&(
        <ButtonGroup>
        {RANK.map((option) => (
          <Button
            key={option.value}
            onClick={() => setRank(prev => prev === option.value ? "" : option.value)}
            variant={rank === option.value ? "contained" : "outlined"}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
      ) }
      
    </div>
  );
};

export default ChartSelect;
