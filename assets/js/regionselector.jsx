// RegionSelector.jsx
import React from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { REGION_OPTIONS } from './constants';
import { MURTY185_INCLUDED_REGIONS } from './constants';

const RegionSelector = ({ region, setRegion, dataset }) => {
  const isEnabled = (option) => {
    return dataset !== 'murty185' || MURTY185_INCLUDED_REGIONS.includes(option.value);
  };

  return (
    <FormControl sx={{  minWidth: 120 }} fullWidth>
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
        {REGION_OPTIONS.map((option) => (
          <Button
            key={option.value}
            onClick={() => isEnabled(option) && setRegion(option.value)}
            variant={region === option.value ? "contained" : "outlined"}
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


export default RegionSelector;

