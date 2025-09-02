// TrainingSelect.jsx
import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import { TRAINING_OPTIONS, TRAINING_OPTIONS_VS } from './constants-scoreboard';

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
    return true;
  };

  const renderButtons = (options) =>
    options.map((option) => (
      <Button
        key={option.value}
        onClick={() => {
          if (!isEnabled(option)) return;
          setTraining((prev) => (prev === option.value ? "" : option.value));
        }}
        variant={training === option.value ? "contained" : "outlined"}
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
        id="training-buttons-group-label"
        sx={{
          textAlign: "left",
          color: "black",
          marginBottom: 1,
        }}
      >
        Training Dataset:
      </FormLabel>
      <ButtonGroup fullWidth>
        {mode === 1 && renderButtons(TRAINING_OPTIONS)}
        {mode === 2 && renderButtons(TRAINING_OPTIONS_VS)}
        {mode === 3 && renderButtons(TRAINING_OPTIONS_VS)}
      </ButtonGroup>
    </FormControl>
  );
};

export default TrainingSelect;
