'use client';
import React, { useState, useEffect, useRef } from 'react';

interface UploaderProps {
  onFilesUploaded: (files: { blobURL: string; file: File }[]) => void;
  onFileMappingsUpdate: (fileMappings: { blobURL: string; file: File }[]) => void;
}

const Uploader: React.FC<UploaderProps> = ({
  onFilesUploaded,
  onFileMappingsUpdate,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [fileList, setFileList] = useState<File[]>([]);
  const [localFileMappings, setLocalFileMappings] = useState<
    { blobURL: string; file: File }[]
  >([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const totalFiles = fileList.length;
  const progressPercent =
    totalFiles > 0 ? Math.round((completedCount / totalFiles) * 100) : 0;

  useEffect(() => {
    onFilesUploaded(localFileMappings);
    onFileMappingsUpdate(localFileMappings);
  }, [localFileMappings, onFilesUploaded, onFileMappingsUpdate]);

  const simulateUpload = (file: File) => {
    setTimeout(() => {
      setCompletedCount((prev) => prev + 1);

      const alert = document.createElement('div');
      alert.className = 'alert alert-success alert-dismissible fade show';
      alert.innerHTML = `
        ${file.name} uploaded successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;

      const container = document.getElementById('upload-alerts');
      if (container) {
        container.appendChild(alert);
        setTimeout(() => {
          alert.classList.remove('show');
          setTimeout(() => container.removeChild(alert), 300);
        }, 3000);
      }
    }, 1000);
  };

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      const ext = file.name.split('.').pop()?.toLowerCase();

      const isImage =
        file.type.startsWith('image/') || ext === 'bmp';

      if (!isImage) return;

      const blobURL = URL.createObjectURL(file);

      setFileList((prev) => [...prev, file]);
      setLocalFileMappings((prev) => [...prev, { blobURL, file }]);

      simulateUpload(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      // Important for Chrome: allow re-selecting same file
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (fileName: string) => {
    setFileList((prev) => prev.filter((f) => f.name !== fileName));
    setLocalFileMappings((prev) =>
      prev.filter((f) => f.file.name !== fileName)
    );
    setCompletedCount((prev) => (prev > 0 ? prev - 1 : 0));
  };

  return (
    <div className="d-flex flex-column gap-2">
      <label
        htmlFor="file-upload"
        className={`card p-4 text-center ${isDragging ? 'bg-light' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: isDragging ? '2px dashed #0d6efd' : '2px dashed #dee2e6',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <div className="mb-3">
          <i
            className="bi bi-cloud-arrow-up"
            style={{ fontSize: '2rem', color: '#0d6efd' }}
          />
        </div>
        <p className="mb-1 fw-bold">Click or drag files to upload</p>
        <p className="text-muted small">JPEG / PNG images</p>

        <input
          ref={inputRef}
          id="file-upload"
          type="file"
          multiple
          accept="image/jpeg,image/png,image/bmp,.bmp"
          className="d-none"
          onChange={handleFileChange}
        />
      </label>

      {totalFiles > 0 && (
        <div className="progress mt-2" style={{ height: '20px' }}>
          <div
            className={`progress-bar progress-bar-striped ${
              progressPercent < 100 ? 'progress-bar-animated' : ''
            }`}
            style={{ width: `${progressPercent}%` }}
          >
            {progressPercent}%
          </div>
        </div>
      )}

      <div id="upload-alerts" className="mt-2" />

      {localFileMappings.length > 0 && (
        <div className="mt-3">
          <h6 className="mb-2">
            Uploaded Files ({localFileMappings.length})
          </h6>
          <div className="list-group">
            {localFileMappings.map((mapping, index) => (
              <div
                key={index}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  <img
                    src={mapping.blobURL}
                    alt={mapping.file.name}
                    style={{
                      width: 40,
                      height: 40,
                      objectFit: 'cover',
                      marginRight: 10,
                    }}
                  />
                  <span>{mapping.file.name}</span>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={(e) => {
                    e.preventDefault();
                    removeFile(mapping.file.name);
                  }}
                >
                  <i className="bi bi-x" />
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
