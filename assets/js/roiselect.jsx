// RegionSelector.jsx
import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import { ROI_OPTIONS, OVERALL_OPTION, REGION_OPTIONS } from './constants-scoreboard';

const ROISelect = ({ region, setRegion, dataset, allowToggle, mode }) => {
 
  const isEnabled = (option) => {
    // === 互斥逻辑 ===
    if((dataset === 'bold_5000'|| dataset ==='bonner_2021') && (option.value === "ffa" || option.value === "eba")) return false;
    if((dataset === 'kingbaker_2019' || dataset === 'wardle_2020') && ( option.value === "eba")) return false;
    
    
    return true;
  };
  const renderButtons = (options) =>
    options.map((option) => (
      <Button
        key={option.value}
        onClick={() => {
          if (!isEnabled(option)) return;
          if (allowToggle) {
            setRegion((prev) => (prev === option.value ? "" : option.value));
          } else {
            setRegion(option.value);
          }
        }}
        variant={region === option.value ? "contained" : "outlined"}
        disabled={!isEnabled(option)}
        sx={{
          "&.Mui-disabled": {
            backgroundColor: "#f3f3f3",
            color: "#c0c0c0",
          },
        }}
      >
        {option.label}
      </Button>
    ));

  return (
    <FormControl sx={{ minWidth: 120 }} fullWidth>
      <FormLabel
        id="region-buttons-group-label"
        sx={{
          textAlign: "left",
          color: "black",
          marginBottom: 1,
        }}
      >
        Region of Interest:
      </FormLabel>
      <ButtonGroup fullWidth>
        {mode === 1 && renderButtons(ROI_OPTIONS)}
        {mode === 2 && renderButtons(ROI_OPTIONS)}
        {mode === 3 && renderButtons(ROI_OPTIONS)}
      </ButtonGroup>
    </FormControl>
  );
};

export default ROISelect;
