// DatasetSelect.jsx
import React from 'react';
import { DATASET_OPTIONS } from './constants-scoreboard';

const DatasetSelect = ({ dataset, setDataset, training, allowToggle }) => {
  // const isEnabled = (option) => {
  //   return training === 'Murty185'
  //     ? MURTY185_DATASET.includes(option.value)
  //     : NSD_DATASET.includes(option.value);
  // };

  return (
    <div className="mb-3">
      <label className="form-label fw-bold">
        Evaluation Dataset:
      </label>
      <div className="btn-group w-100" role="group" aria-label="Dataset selection">
        {DATASET_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn ${dataset === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => {
              if (allowToggle) {
                setDataset(prev => prev === option.value ? "" : option.value);
              } else {
                setDataset(option.value);
              }
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DatasetSelect;
