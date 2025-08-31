// chartselect.jsx
import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { CHART_TYPE_OPTIONS, CHART_SCOPE_OPTIONS } from './constants-scoreboard';

const ChartSelect = ({ chartType, setChartType, chartScope, setChartScope }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "20px", margin: "10px 0" }}>
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
      <ButtonGroup>
        {CHART_SCOPE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => setChartScope(option.value)}
            variant={chartScope === option.value ? "contained" : "outlined"}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
    </div>
  );
};

export default ChartSelect;
