import React from 'react';
import {
  FormGroup,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import Select from '@mui/material/Select';

import {
  MODEL_OPTIONS,
  DATASET_OPTIONS,
  REGION_OPTIONS,
  VOXEL_OPTIONS,
  PAPER_OPTIONS,
} from './constants';

const Settings = ({
  mode = 'default', // 'default' for model setting, 'paper' for stimuli input
  model,
  setModel,
  dataset,
  setDataset,
  region,
  setRegion,
  voxelOption,
  setVoxelOption,
  voxelNumber,
  setVoxelNumber,
  participantName,
  setParticipantName,
  paper,
  setPaper,
}) => {
  if (mode === 'paper') {
    return (
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
  }

  return (
    <FormGroup
      sx={{
        gap: 1, // Vertical space between controls
        padding: 3, // Padding around the group
        backgroundColor: 'white', // Optional background styling
        borderRadius: '8px',
        width: { xs: '90%', sm: '90%', md: '90%' }, // Responsive width
        margin: '0 auto', // Center horizontally
      }}
    >

      {/* Region Selection */}
      <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth size="small">
        <InputLabel
          sx={{
            backgroundColor: 'white',
          }}
          id="region-select-label"
        >
          Select a Region of Interest
        </InputLabel>
        <Select
          labelId="region-select-label"
          id="region-select"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {REGION_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div style={{ height: '20px' }}></div>
      <Typography variant="body2" sx={{ textAlign: 'left', color: 'gray', mt: 1, px: 2 }}>
      Advanced Settings:
      </Typography>

       

      {/* Model Selection */}
      <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth size="small">
        <InputLabel
          sx={{
            backgroundColor: 'white',
          }}
          id="model-select-label"
        >
          Select a Model
        </InputLabel>
        <Select
          labelId="model-select-label"
          id="model-select"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          sx={{
            backgroundColor: 'white',
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {MODEL_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Dataset Selection */}
      <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth size="small">
        <InputLabel
          sx={{
            backgroundColor: 'white',
          }}
          id="dataset-select-label"
        >
          Select a Dataset
        </InputLabel>
        <Select
          labelId="dataset-select-label"
          id="dataset-select"
          value={dataset}
          onChange={(e) => setDataset(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {DATASET_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Voxel Selection */}
      <FormControl sx={{ m: 1, minWidth: 120 }} fullWidth size="small">
        <InputLabel
          sx={{
            backgroundColor: 'white',
          }}
          id="voxel-select-label"
        >
          Select Voxels
        </InputLabel>
        <Select
          labelId="voxel-select-label"
          id="voxel-select"
          value={voxelOption}
          onChange={(e) => setVoxelOption(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {VOXEL_OPTIONS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>

        {voxelOption === 'random-voxels' && (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Enter number of voxels"
            value={voxelNumber}
            onChange={(e) => setVoxelNumber(e.target.value)}
            sx={{
              marginTop: 2,
              backgroundColor: 'white',
              borderRadius: '4px',
            }}
          />
        )}

        {voxelOption === 'specify-a-participant' && (
          <TextField
            variant="outlined"
            size="small"
            placeholder="Enter participant name (e.g., p1)"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            sx={{
              marginTop: 2,
              backgroundColor: 'white',
              borderRadius: '4px',
            }}
          />
        )}
      </FormControl>

    </FormGroup>

  );






};

export default Settings;
