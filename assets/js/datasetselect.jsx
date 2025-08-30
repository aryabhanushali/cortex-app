import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { DATASET_OPTIONS_LEFT, DATASET_OPTIONS_RIGHT } from './constants-scoreboard';



const DatasetSelect = ({ dataset, setDataset, training, allowToggle}) => {
  // const isEnabled = (option) => {
  //   return training === 'Murty185'
  //     ? MURTY185_DATASET.includes(option.value)
  //     : NSD_DATASET.includes(option.value);
  // };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormLabel
          id="dataset-label"
          sx={{ color: 'black', marginBottom: 1 }}
        >
          Evaluation Dataset:
        </FormLabel>
      </div>

          
      <ButtonGroup aria-labelledby="region-buttons-group-label" fullWidth sx={{ margin: 0 }}>
        {DATASET_OPTIONS_LEFT.map((option) => (
          <Button
            key={option.value}
            onClick={() => {
              if (allowToggle) {
                setDataset((prev) => (prev === option.value ? '' : option.value));
              } else {
                setDataset(option.value);
              }
            }}
            variant={dataset === option.value ? 'contained' : 'outlined'}
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
    </FormControl>
  );
};


export default DatasetSelect;


