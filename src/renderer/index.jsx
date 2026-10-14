import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StateProvider from './state/StateProvider';
import AnnouncerProvider from './state/AnnouncerProvider';
import AudioRoutingProvider from './audio/AudioRoutingProvider';
import './index.css';

// "6" is the attract enter/exit signal the app sends itself (see AttractScene);
// it is not a keypad key, so swallow it before any app handler sees it.
const swallowAttractSignal = (e) => {
  if (e.key === '6' || e.code === 'Digit6') {
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

