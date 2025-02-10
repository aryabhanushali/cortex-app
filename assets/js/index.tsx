import React from 'react';
import { createRoot } from 'react-dom/client';
import Stepper from './stepper';

function App() {
  return (
    <div>
      <Stepper />
    </div>
  );
}

const container = document.getElementById('container');
if (container) {
  createRoot(container).render(
    <App />
  );
} else {
  console.error("Failed to find the 'container' element.");
}
