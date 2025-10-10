'use client'
import React from 'react';
import { MODEL_OPTIONS, MODELCARD_INFO_LOOKUP } from './constants';

const ModelCard = ({ region, dataset, model }) => {
  // Remove console logs for production
  const getInfo = (dataset, region, model) => {
    return MODELCARD_INFO_LOOKUP[dataset]?.[region]?.[model] || { bestLayer: 'unknown', corrScore: 0 };
  };

  const modelMeta = MODEL_OPTIONS.find(option => option.value === model);
  const modelName = modelMeta?.label || model;
  const modelType = modelMeta?.type || 'Unknown Model Type';
  const cardUrl = `model-pages/${model}.html`;

  const { bestLayer, corrScore } = getInfo(dataset, region, model);

  return (
    <div className="card shadow-sm border-0 mb-4 hover-shadow transition-all">
      <div className="card-header bg-primary text-white py-3">
        <h5 className="mb-0 fw-bold">Model Information</h5>
      </div>
      <div className="card-body p-4">
        <div className="d-flex align-items-center mb-3">
          <div className="model-icon me-3">
            <i className="bi bi-cpu fs-2 text-primary"></i>
          </div>
          <div>
            <h4 className="card-title mb-1">
              <a href={cardUrl} className="text-decoration-none text-primary">
                {modelName} <i className="bi bi-box-arrow-up-right fs-6"></i>
              </a>
            </h4>
            <span className="badge bg-light text-dark">{modelType}</span>
          </div>
        </div>

        <div className="row mt-4">
          <div className="col-md-4 mb-3">
            <div className="info-box p-3 bg-light rounded">
              <h6 className="text-muted mb-1 small">ROI</h6>
              <p className="mb-0 fw-bold">{region.toUpperCase()}</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="info-box p-3 bg-light rounded">
              <h6 className="text-muted mb-1 small">Optimal Layer</h6>
              <p className="mb-0 fw-bold">{bestLayer}</p>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className="info-box p-3 bg-light rounded">
              <h6 className="text-muted mb-1 small">Correlation Score</h6>
              <p className="mb-0 fw-bold">{corrScore.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-top">
          <p className="text-muted mb-0">
            <i className="bi bi-info-circle me-2"></i>
            This model was evaluated on the <span className="fw-bold">{dataset}</span> fMRI dataset
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelCard;
