import React from 'react';
import { Loader2, CloudRain } from 'lucide-react';

const Loading = ({ message = 'Fetching weather data...' }) => {
  return (
    <div className="loading-container animate-fade-in" role="status" aria-live="polite">
      <div className="loading-card">
        <div className="loading-animation">
          <CloudRain className="loading-cloud-icon" size={48} />
          <Loader2 className="loading-spinner-ring" size={64} />
        </div>
        <h4 className="loading-title">{message}</h4>
        <p className="loading-subtext">Connecting to atmospheric data streams...</p>
      </div>
    </div>
  );
};

export default Loading;