// Settings.jsx
import React from 'react';
import {
  FormGroup,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
  Select,
} from '@mui/material';

import {
  MODEL_OPTIONS,
  DATASET_OPTIONS,
  VOXEL_OPTIONS,
} from './constants';

const Settings = ({
  model,
  setModel,
  dataset,
  setDataset,
  voxelOption,
  setVoxelOption,
  voxelNumber,
  setVoxelNumber,
  participantName,
  setParticipantName,
}) => {
  return (
    <FormGroup
      sx={{
        gap: 1,
        padding: 0,
        margintop: 2,
        marginLeft: 0,
        backgroundColor: 'white',
        borderRadius: '8px',
        width: { xs: '90%', sm: '50%', md: '90%' },
        marginRight: '0 auto',
        flexDirection: { xs: 'column', md: 'row !important' }
      }}
    >
      <Typography variant="body2" sx={{ textAlign: 'left', color: 'black', mt: 1, px: 2 }}>
        Advanced Settings:
      </Typography>

      {/* Model Selection */}
      <FormControl sx={{ m: 1, minWidth: 120, textAlign: 'left'}} fullWidth size="small">
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
      <FormControl sx={{ m: 1, minWidth: 120, textAlign: 'left'}} fullWidth size="small">
        <InputLabel
          sx={{
            backgroundColor: 'white',
          }}
          id="dataset-select-label"
        >
          Select a fMRI Dataset
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
      <FormControl sx={{ m: 1, minWidth: 120, textAlign: 'left'}} fullWidth size="small">
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
