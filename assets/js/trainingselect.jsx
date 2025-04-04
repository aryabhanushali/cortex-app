// RegionSelector.jsx
import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { TRAINING_OPTIONS } from './constants-scoreboard';
import { MURTY185_INCLUDED_REGIONS } from './constants-scoreboard';

const TrainingSelect = ({ training, setTraining, dataset }) => {
  // const isEnabled = (option) => {
  //   return dataset !== 'murty185' || MURTY185_INCLUDED_REGIONS.includes(option.value);
  // };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth>
      <FormLabel
        id="region-buttons-group-label"
        sx={{

          textAlign: 'left',
          color: 'black',
          marginBottom:0,
        }}
      >
        Training Dataset:
      </FormLabel>
      <ButtonGroup 
        aria-labelledby="region-buttons-group-label"
        fullWidth
      >
        {TRAINING_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => setTraining(option.value)}
            variant={training === option.value ? "contained" : "outlined"}
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


export default TrainingSelect;

