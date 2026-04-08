import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StateProvider from './state/StateProvider';
import AnnouncerProvider from './state/AnnouncerProvider';
import AudioRoutingProvider from './audio/AudioRoutingProvider';
import './index.css';

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

