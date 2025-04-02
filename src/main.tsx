
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure audio can play without user gesture when possible
document.addEventListener('DOMContentLoaded', () => {
  // Try to enable audio
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      const resumeAudio = () => {
        audioContext.resume();
        console.log('Audio context resumed');
        document.body.removeEventListener('click', resumeAudio);
        document.body.removeEventListener('touchstart', resumeAudio);
      };
      
      document.body.addEventListener('click', resumeAudio);
      document.body.addEventListener('touchstart', resumeAudio);
    }
  } catch (e) {
    console.warn('Audio context not supported');
  }
});

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
