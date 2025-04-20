import React from 'react';
import { REGION_OPTIONS } from './constants-scoreboard';

const ROISelect = ({ region, setRegion, dataset, allowToggle }) => {
  return (
    <div className="mb-3">
      <label className="form-label fw-bold">
        Region of Interest:
      </label>
      <div className="btn-group w-100" role="group" aria-label="Region selection">
        {REGION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`btn ${region === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => {
              if (allowToggle) {
                setRegion(prev => prev === option.value ? "" : option.value);
              } else {
                setRegion(option.value);
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

export default ROISelect;
