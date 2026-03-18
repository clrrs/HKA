import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StateProvider from './state/StateProvider';
import AnnouncerProvider from './state/AnnouncerProvider';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StateProvider>
      <AnnouncerProvider>
        <App />
      </AnnouncerProvider>
    </StateProvider>
  </React.StrictMode>
);

