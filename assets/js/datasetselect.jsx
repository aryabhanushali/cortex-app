// RegionSelector.jsx
import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { DATASET_OPTIONS } from './constants-scoreboard';
import { MURTY185_DATASET } from './constants-scoreboard';
import { NSD_DATASET } from './constants-scoreboard';


const DatasetSelect = ({ dataset, setDataset, training }) => {
  const isEnabled = (option) => {
    return training === 'Murty185'
      ? MURTY185_DATASET.includes(option.value)
      : NSD_DATASET.includes(option.value);
  };

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
        Select a Region of Interest
      </FormLabel>
      <ButtonGroup 
        aria-labelledby="region-buttons-group-label"
        fullWidth
      >
        {DATASET_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => isEnabled(option) && setDataset(option.value)}
            variant={dataset === option.value ? "contained" : "outlined"}
            disabled={!isEnabled(option)}
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


export default DatasetSelect;

