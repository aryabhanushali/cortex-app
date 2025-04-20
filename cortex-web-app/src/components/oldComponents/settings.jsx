// Settings.jsx
import React from 'react';
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
    <div 
      className="form-group"
      style={{
        gap: '0.25rem',
        padding: 0,
        marginTop: '0.5rem',
        marginLeft: 0,
        backgroundColor: 'white',
        borderRadius: '8px',
        width: '100%',
        marginRight: '0 auto',
      }}
    >
      <p className="text-left text-body small mt-1 px-2" style={{ color: 'black' }}>
        Advanced Settings:
      </p>

      {/* Model Selection */}
      <div className="form-group m-1" style={{ minWidth: '120px', textAlign: 'left' }}>
        <label 
          htmlFor="model-select"
          className="form-label"
          style={{
            backgroundColor: 'white',
          }}
        >
          Select a base-model architecture
        </label>
        <select
          id="model-select"
          className="form-select form-select-sm"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={{
            backgroundColor: 'white',
          }}
        >
          <option value="">None</option>
          {MODEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dataset Selection */}
      <div className="form-group m-1" style={{ minWidth: '120px', textAlign: 'left' }}>
        <label 
          htmlFor="dataset-select"
          className="form-label"
          style={{
            backgroundColor: 'white',
          }}
        >
          Select the fMRI mapping dataset
        </label>
        <select
          id="dataset-select"
          className="form-select form-select-sm"
          value={dataset}
          onChange={(e) => setDataset(e.target.value)}
        >
          <option value="">None</option>
          {DATASET_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Voxel Selection */}
      <div className="form-group m-1" style={{ minWidth: '120px', textAlign: 'left' }}>
        <label 
          htmlFor="voxel-select"
          className="form-label"
          style={{
            backgroundColor: 'white',
          }}
        >
          Select Voxels
        </label>
        <select
          id="voxel-select"
          className="form-select form-select-sm"
          value={voxelOption}
          onChange={(e) => setVoxelOption(e.target.value)}
        >
          <option value="">None</option>
          {VOXEL_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {voxelOption === 'random-voxels' && (
          <input
            type="text"
            className="form-control form-control-sm mt-2"
            placeholder="Enter number of voxels"
            value={voxelNumber}
            onChange={(e) => setVoxelNumber(e.target.value)}
            style={{
              backgroundColor: 'white',
              borderRadius: '4px',
            }}
          />
        )}

        {voxelOption === 'specify-a-participant' && (
          <input
            type="text"
            className="form-control form-control-sm mt-2"
            placeholder="Enter participant name (e.g., p1)"
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            style={{
              backgroundColor: 'white',
              borderRadius: '4px',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Settings;
