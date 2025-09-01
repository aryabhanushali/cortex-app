import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { DATASET_OPTIONS_LEFT, DATASET_OPTIONS_RIGHT, MURTY185_DATASET, NSD_DATASET } from './constants-scoreboard';

const DatasetSelect = ({ dataset, setDataset, training, allowToggle, mode}) => {
  const isEnabled = (option) => {
    if (mode === 1 || mode === 2) {
      if (training === 'Murty185') {
      return MURTY185_DATASET.includes(option.value);
    } else if (training === 'NSD') {
      return NSD_DATASET.includes(option.value);
    }
    }
    
    return true; // 没选 training 时，全部禁用
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
        {DATASET_OPTIONS_LEFT.map((option) => (
          <Button
            key={option.value}
            onClick={() => {
              if (!isEnabled(option)) return; // 禁用时不触发
              if (allowToggle) {
                setDataset((prev) => (prev === option.value ? '' : option.value));
              } else {
                setDataset(option.value);
              }
            }}
            variant={dataset === option.value ? 'contained' : 'outlined'}
            disabled={!isEnabled(option)} // ✅ 不能选的直接禁用
          >
            {option.label}
          </Button>
        ))}
      </ButtonGroup>
    </FormControl>
  );
};

export default DatasetSelect;
