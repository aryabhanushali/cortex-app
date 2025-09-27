import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { DATASET_OPTIONS, DATASET_OPTIONS_LESS, MURTY185_DATASET, NSD_DATASET } from './constants-scoreboard';

const DatasetSelect = ({ dataset, setDataset, training, region, allowToggle, mode}) => {
  const isEnabled = (option) => {
    let enabled = true;

    // traingsouces restrictions
    if (training === 'Murty185' && !MURTY185_DATASET.includes(option.value)) {
      enabled = false;
    }
    if (training === 'NSD' && !NSD_DATASET.includes(option.value)) {
      enabled = false;
    }
    if (training === "VS" && (option.value === "murty185" || option.value === "nsd_1000")) {
      enabled = false;
    }

    // ROI restrictions
    if ((region === "ffa" || region === "eba") && (option.value === "bonner_2021" || option.value === "bold_5000")) {
      enabled = false;
    }
    if (region === "eba" && (option.value === "kingbaker_2019" || option.value === "wardle_2020")) {
      enabled = false;
    }

    return enabled;
};


  return (
    <FormControl sx={{ minWidth: 120 }} fullWidth>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormLabel
          id="dataset-label"
          sx={{ color: 'black', marginBottom: 1 }}
        >
          Evaluation Dataset:
        </FormLabel>
      </div>

      <ButtonGroup aria-labelledby="region-buttons-group-label" fullWidth sx={{ margin: 0 }}>
        {(mode === 4 ? DATASET_OPTIONS_LESS : DATASET_OPTIONS).map((option) => (
          <Button
            key={option.value}
            onClick={() => {
              if (!isEnabled(option)) return; 
              if (allowToggle) {
                setDataset((prev) => (prev === option.value ? '' : option.value));
              } else {
                setDataset(option.value);
              }
            }}
            variant={dataset === option.value ? 'contained' : 'outlined'}
            disabled={!isEnabled(option)} 
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
    </FormControl>
  );
};

export default DatasetSelect;
