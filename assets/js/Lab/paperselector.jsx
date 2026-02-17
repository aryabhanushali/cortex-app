// PaperSelector.jsx
import React from 'react';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { PAPER_OPTIONS } from './constants';

const PaperSelector = ({ paper, setPaper }) => (
  <FormControl sx={{ m: 1, minWidth: 120, width: '90%', margin: '0 auto', marginBottom: 2 }} fullWidth size="small">
    <InputLabel
      sx={{
        backgroundColor: 'white',
      }}
      id="paper-select-label"
    >
      Select from Pre-set
    </InputLabel>
    <Select
      labelId="paper-select-label"
      id="paper-select"
      value={paper}
      onChange={(e) => setPaper(e.target.value)}
    >
      <MenuItem value="">
        <em>None</em>
      </MenuItem>
      {PAPER_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default PaperSelector;
