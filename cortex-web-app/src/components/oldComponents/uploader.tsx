'use client'
import React, { useState, useEffect } from "react";

interface UploaderProps {
  onFilesUploaded: (files: { blobURL: string; file: File }[]) => void;
  onFileMappingsUpdate: (fileMappings: { blobURL: string; file: File }[]) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onFilesUploaded, onFileMappingsUpdate }) => {
  const [fileList, setFileList] = useState<File[]>([]);
  const [localFileMappings, setLocalFileMappings] = useState<{ blobURL: string; file: File }[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate overall progress
  const totalFiles = fileList.length;
  const progressPercent = totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;

  // Trigger parent callbacks when file mappings update
  useEffect(() => {
    const timerId = setTimeout(() => {
      onFilesUploaded(localFileMappings);
      onFileMappingsUpdate(localFileMappings);
    }, 0);

    return () => clearTimeout(timerId);
  }, [localFileMappings, onFilesUploaded, onFileMappingsUpdate]);

  // Simulated upload process
  const simulateUpload = (file: File) => {
    setTimeout(() => {
      setCompletedCount((prev) => prev + 1);
      // Show success message
      const alertElement = document.createElement('div');
      alertElement.className = 'alert alert-success alert-dismissible fade show';
      alertElement.innerHTML = `
        ${file.name} uploaded successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      
      const container = document.getElementById('upload-alerts');
      if (container) {
        container.appendChild(alertElement);
        setTimeout(() => {
          alertElement.classList.remove('show');
          setTimeout(() => container.removeChild(alertElement), 300);
        }, 3000);
      }
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      processFiles(newFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      processFiles(newFiles);
    }
  };

  const processFiles = (newFiles: File[]) => {
    newFiles.forEach(file => {
      if (file.type.match('image.*')) {
        const blobURL = URL.createObjectURL(file);
        
        setFileList(prevList => [...prevList, file]);
        setLocalFileMappings(prevMappings => [
          ...prevMappings,
          { blobURL, file }
        ]);
        
        simulateUpload(file);
      }
    });
  };

  const removeFile = (fileName: string) => {
    setFileList(prevList => {
      const newList = prevList.filter(f => f.name !== fileName);
      if (prevList.length !== newList.length) {
        setCompletedCount(prev => (prev > 0 ? prev - 1 : 0));
      }
      return newList;
    });

    setLocalFileMappings(prevMappings =>
      prevMappings.filter(f => f.file.name !== fileName)
    );
  };

  return (
    <div className="d-flex flex-column gap-2">
      <div 
        className={`card p-4 text-center ${isDragging ? 'bg-light' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ 
          border: isDragging ? '2px dashed #0d6efd' : '2px dashed #dee2e6',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <div className="mb-3">
          <i className="bi bi-cloud-arrow-up" style={{ fontSize: '2rem', color: '#0d6efd' }}></i>
        </div>
        <p className="mb-1 fw-bold">Click or drag files to this area to upload</p>
        <p className="text-muted small">Upload one or more .jpg/png files</p>
        <input 
          id="file-upload" 
          type="file" 
          multiple 
          accept="image/jpeg,image/png" 
          className="d-none"
          onChange={handleFileChange}
        />
      </div>

      {totalFiles > 0 && (
        <div className="progress mt-2" style={{ height: '20px' }}>
          <div 
            className={`progress-bar progress-bar-striped ${progressPercent < 100 ? 'progress-bar-animated' : ''}`}
            role="progressbar" 
            style={{ width: `${progressPercent}%` }}
            aria-valuenow={progressPercent} 
            aria-valuemin={0} 
            aria-valuemax={100}
          >
            {progressPercent}%
          </div>
        </div>
      )}

      <div id="upload-alerts" className="mt-2"></div>

      {localFileMappings.length > 0 && (
        <div className="mt-3">
          <h6 className="mb-2">Uploaded Files ({localFileMappings.length})</h6>
          <div className="list-group">
            {localFileMappings.map((mapping, index) => (
              <div key={index} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img 
                    src={mapping.blobURL} 
                    alt={mapping.file.name} 
                    style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }} 
                  />
                  <span>{mapping.file.name}</span>
                </div>
                <button 
                  className="btn btn-sm btn-outline-danger" 
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(mapping.file.name);
                  }}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Uploader;
