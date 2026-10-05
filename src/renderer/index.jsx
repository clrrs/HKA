import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StateProvider from './state/StateProvider';
import AnnouncerProvider from './state/AnnouncerProvider';
import BrailleProvider from './state/BrailleProvider';
import AudioRoutingProvider from './audio/AudioRoutingProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StateProvider>
      <AudioRoutingProvider>
        <BrailleProvider>
          <AnnouncerProvider>
            <App />
          </AnnouncerProvider>
        </BrailleProvider>
      </AudioRoutingProvider>
    </StateProvider>
  </React.StrictMode>
);

