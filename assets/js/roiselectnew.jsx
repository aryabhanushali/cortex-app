// import React, { useState, useEffect } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Checkbox,
  FormControl,
  FormGroup,
  FormControlLabel,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ROI_OPTIONS } from './constants-scoreboard';

const ROISelectNew = ({ region, setRegion, dataset, setDataset, allowToggle, mode, training }) => {
  // button logic group
  const ACROSS_VAL = 'Across Regions';
  const SPECIFIC_ROIS = ['ppa', 'ffa', 'eba'];

  // dataset/roi enabled / disabled logic
  const isEnabled = (option) => {
    if ((dataset === 'bold_5000' || dataset === 'bonner_2021') && (option.value === 'ffa' || option.value === 'eba'))
      return false;
    if ((dataset === 'kingbaker_2019' || dataset === 'wardle_2020') && option.value === 'eba')
      return false;
    return true;
  };


  // interactive logic
  const handleChange = (value) => {
    if (!isEnabled({ value })) return;

    setRegion((prev) => {
      // 
      const current = Array.isArray(prev) ? prev : (prev ? [prev] : []);
      const isSelected = current.includes(value);
      
      let nextState = [];

      // 
      if (value === ACROSS_VAL) {
        if (isSelected) {
          // cancel the accross regions
          nextState = current.filter((v) => v !== value);
        } else {
          // clear all rois then selected accross regions
          nextState = [value];
        }
      } else if (SPECIFIC_ROIS.includes(value)) {
        if (isSelected) {
          // if it is roi then just cancel select
          nextState = current.filter((v) => v !== value);
        } else {
          // new roi then add it and cancel out accross rois
          const filtered = current.filter((v) => v !== ACROSS_VAL);
          nextState = [...filtered, value];
        }
      } else {
        // other
        nextState = isSelected 
          ? current.filter((v) => v !== value) 
          : [...current, value];
      }

      // non empty protect: always check across-region if it is empty
      if (nextState.length === 0) {
        return [ACROSS_VAL];
      }

      return nextState;
    });
  };


  const isChecked = (value) => Array.isArray(region) && region.includes(value);

  return (
    //defaultExpanded (disabled default expand)
    <Accordion  disableGutters sx={{ bgcolor: 'transparent' }}> 
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'black' }} />}
        sx={{
          bgcolor: '#f5f5f5',
          borderRadius: 1,
          '&.Mui-expanded': { bgcolor: '#eaeaea' },
          minHeight: 40,
          px: 1.5,
        }}
      >
        <Typography sx={{ fontWeight: 'bold', color: 'black' }}>Region of Interest</Typography>
      </AccordionSummary>

      <AccordionDetails sx={{ pl: 2 }}>
        <FormControl component="fieldset" variant="standard" sx={{ width: '100%' }}>
          <FormGroup sx={{ mt: 0.5 }}>
            {ROI_OPTIONS.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={isChecked(option.value)}
                    onChange={() => handleChange(option.value)}
                    disabled={!isEnabled(option)}
                    sx={{
                      '&.Mui-checked': { color: '#e8de70ff' },
                      '&.Mui-disabled': { color: '#b0b0b0' },
                    }}
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  );
};

export default ROISelectNew;