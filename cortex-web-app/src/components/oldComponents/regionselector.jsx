// RegionSelector.jsx
import React from 'react';
import { REGION_OPTIONS } from './constants';
import { MURTY185_INCLUDED_REGIONS } from './constants';

const RegionSelector = ({ region, setRegion, dataset }) => {
  const isEnabled = (option) => {
    return dataset !== 'murty185' || MURTY185_INCLUDED_REGIONS.includes(option.value);
  };

  return (
    <div className="form-group mb-3">
      <label 
        id="region-buttons-group-label" 
        className="form-label" 
        style={{
          textAlign: 'left',
          color: 'black',
          marginBottom: '0.5rem',
        }}
      >
        Select a Region of Interest
      </label>
      <div 
        className="btn-group w-100" 
        role="group" 
        aria-labelledby="region-buttons-group-label"
      >
        {REGION_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => isEnabled(option) && setRegion(option.value)}
            className={`btn ${region === option.value ? 'btn-primary' : 'btn-outline-primary'}`}
            disabled={!isEnabled(option)}
            style={{
              opacity: !isEnabled(option) ? 0.65 : 1,
              backgroundColor: !isEnabled(option) ? '#f3f3f3' : '',
              color: !isEnabled(option) ? '#c0c0c0' : ''
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RegionSelector;
