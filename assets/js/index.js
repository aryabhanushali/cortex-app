import React from 'react';
import { createRoot } from 'react-dom/client';
import { Comments } from './components.jsx'; // Ensure correct path

// Wait until the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const commentDomNode = document.getElementById('comments');
  if (commentDomNode) {
    const commentRoot = createRoot(commentDomNode);
    commentRoot.render(React.createElement(Comments));
  }
});