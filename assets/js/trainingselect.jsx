// TrainingSelect.jsx
import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { TRAINING_OPTIONS } from './constants-scoreboard';

const TrainingSelect = ({ training, setTraining, dataset, mode }) => {
  const isEnabled = (option) => {
    if (mode === 3) {
      if (dataset === 'murty185' && option.value.toLowerCase() === 'murty185') {
        return false; // Murty185 dataset 禁止 Training 选 Murty185
      }
      if (dataset === 'nsd1000' && option.value.toLowerCase() === 'nsd') {
        return false; // NSD dataset 禁止 Training 选 NSD
      }
    }
    return true; // 其他情况正常
  };

  return (
    <FormControl sx={{minWidth: 120 }} fullWidth>
      <FormLabel
        id="training-buttons-group-label"
        sx={{
          textAlign: 'left',
          color: 'black',
          marginBottom: 0,
        }}
      >
        Training Dataset:
      </FormLabel>
      <ButtonGroup 
        aria-labelledby="training-buttons-group-label"
        fullWidth
      >
        {TRAINING_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => {
              if (!isEnabled(option)) return; // 禁用不响应
              setTraining(prev => prev === option.value ? "" : option.value);
            }}
            variant={training === option.value ? "contained" : "outlined"}
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

export default TrainingSelect;
