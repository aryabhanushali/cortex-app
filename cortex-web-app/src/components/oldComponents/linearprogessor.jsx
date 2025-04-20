'use client'
import React, { useEffect, useState } from 'react';

export default function LinearIndeterminate() {
  const [progress, setProgress] = useState(15);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        // Create a pulsing effect by moving back and forth
        if (prevProgress >= 90) return 15;
        return prevProgress + 5;
      });
    }, 800);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-100 my-2">
      <div className="progress" style={{ height: '6px', borderRadius: '3px', backgroundColor: '#e9ecef', boxShadow: 'inset 0 1px 2px rgba(0,0,0,.1)' }}>
        <div 
          className="progress-bar progress-bar-striped progress-bar-animated" 
          role="progressbar" 
          aria-valuenow={progress} 
          aria-valuemin="0" 
          aria-valuemax="100" 
          style={{ 
            width: `${progress}%`,
            background: 'linear-gradient(45deg, #0d6efd, #0dcaf0)',
            backgroundSize: '1rem 1rem',
            borderRadius: '3px',
            transition: 'width 0.6s ease'
          }}
        ></div>
      </div>
      <div className="d-flex justify-content-end">
        <small className="text-muted mt-1" style={{ fontSize: '0.75rem' }}>Processing...</small>
      </div>
    </div>
  );
}