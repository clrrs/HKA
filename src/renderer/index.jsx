import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StateProvider from './state/StateProvider';
import AnnouncerProvider from './state/AnnouncerProvider';
import AudioRoutingProvider from './audio/AudioRoutingProvider';
import './index.css';

// "8" / "6" are attract start/dismiss signals the app sends itself (see AttractScene);
// they are not keypad keys, so swallow them before any app handler sees them.
const swallowAttractSignal = (e) => {
  if (e.key === '6' || e.code === 'Digit6' || e.key === '8' || e.code === 'Digit8') {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
};
['keydown', 'keypress', 'keyup'].forEach((type) =>
  window.addEventListener(type, swallowAttractSignal, true)
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StateProvider>
      <AudioRoutingProvider>
        <AnnouncerProvider>
          <App />
        </AnnouncerProvider>
      </AudioRoutingProvider>
    </StateProvider>
  </React.StrictMode>
);

