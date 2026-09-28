import React from 'react';
import { AlertCircle, X, RotateCcw } from 'lucide-react';

const ErrorMessage = ({ message, onDismiss, onRetry }) => {
  if (!message) return null;

  return (
    <div className="error-banner animate-fade-in" role="alert">
      <div className="error-icon-box">
        <AlertCircle size={22} className="error-icon" />
      </div>

      <div className="error-content">
        <span className="error-title">Notice</span>
        <p className="error-message-text">{message}</p>
      </div>

      <div className="error-actions">
        {onRetry && (
          <button
            type="button"
            className="error-retry-btn"
            onClick={onRetry}
            title="Retry request"
          >
            <RotateCcw size={15} />
            <span>Retry</span>
          </button>
        )}

        {onDismiss && (
          <button
            type="button"
            className="error-dismiss-btn"
            onClick={onDismiss}
            aria-label="Dismiss error notification"
            title="Dismiss"
          >
            <X size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;