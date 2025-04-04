// RegionSelector.jsx
import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { REGION_OPTIONS } from './constants-scoreboard';


const ROISelect = ({ region, setRegion, dataset,allowToggle }) => {
  

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
      <FormLabel
        id="region-buttons-group-label"
        sx={{
          textAlign: 'left',
          color: 'black',
          marginBottom: 1,
        }}
      >
        Region of Interest:
      </FormLabel>
      <ButtonGroup 
        aria-labelledby="region-buttons-group-label"
        fullWidth
      >
        {REGION_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => {
              if (allowToggle) {
                setRegion(prev => prev === option.value ? "" : option.value);
              } else {
                setRegion(option.value); 
              }
            }}
            variant={region === option.value ? "contained" : "outlined"}
            
            sx={{
              "&.Mui-disabled": {
                backgroundColor: "#f3f3f3",
                color: "#c0c0c0"
              }
            }}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
    </FormControl>
  );
};


export default ROISelect;

