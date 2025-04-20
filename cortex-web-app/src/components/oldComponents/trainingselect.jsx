// TrainingSelect.jsx
import React from 'react';
import { TRAINING_OPTIONS } from './constants-scoreboard';
import { MURTY185_INCLUDED_REGIONS } from './constants-scoreboard';

const TrainingSelect = ({ training, setTraining, dataset }) => {
  // const isEnabled = (option) => {
  //   return dataset !== 'murty185' || MURTY185_INCLUDED_REGIONS.includes(option.value);
  // };

  return (
    <div className="mb-3">
      <label className="form-label fw-bold">
        Training Dataset:
      </label>
      <div className="btn-group w-100" role="group" aria-label="Training dataset selection">
        {TRAINING_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn ${training === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => setTraining(option.value)}
            data-bs-toggle="tooltip"
            data-bs-placement="top"
            title={`Select ${option.label} as training dataset`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="form-text mt-1">
        Select the dataset used for model training
      </div>
    </div>
  );
};

export default TrainingSelect;
