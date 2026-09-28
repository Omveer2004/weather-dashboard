import React from 'react';
import { History, Trash2, RotateCw, MapPin, Clock } from 'lucide-react';

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTemp = (celsius, unit) => {
  if (celsius === null || celsius === undefined) return '';
  if (unit === 'imperial') {
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
};

const SearchHistory = ({
  history = [],
  onSelectCity,
  onDeleteItem,
  onClearHistory,
  unit,
  isLoading,
}) => {
  return (
    <div className="history-section">
      <div className="history-header">
        <div className="history-title-group">
          <History size={20} className="history-title-icon" />
          <h3 className="section-title">Recent Searches</h3>
          {history.length > 0 && (
            <span className="history-count-badge">{history.length}</span>
          )}
        </div>

        {history.length > 0 && (
          <button
            type="button"
            className="btn-clear-history"
            onClick={onClearHistory}
            disabled={isLoading}
            title="Clear entire search history"
            aria-label="Clear all history"
          >
            <Trash2 size={15} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="history-empty-state">
          <Clock size={32} className="empty-icon" />
          <p className="empty-text">No recent searches yet</p>
          <span className="empty-subtext">
            Cities you search for will appear here for fast access.
          </span>
        </div>
      ) : (
        <ul className="history-list">
          {history.map((item) => (
            <li key={item._id || `${item.city}-${item.searchedAt}`} className="history-item">
              <button
                type="button"
                className="history-main-click"
                onClick={() => onSelectCity(item.city)}
                disabled={isLoading}
                title={`Search weather for ${item.city}, ${item.country}`}
              >
                <div className="history-location">
                  <MapPin size={16} className="history-pin" />
                  <span className="history-city-name">{item.city}</span>
                  <span className="history-country-code">{item.country}</span>
                </div>

                <div className="history-meta">
                  {item.temperature !== null && item.temperature !== undefined && (
                    <span className="history-temp-badge">
                      {formatTemp(item.temperature, unit)}
                    </span>
                  )}
                  {item.weatherCondition && (
                    <span className="history-condition-tag">
                      {item.weatherCondition}
                    </span>
                  )}
                  <span className="history-time-ago">
                    {formatTimeAgo(item.searchedAt || item.createdAt)}
                  </span>
                </div>
              </button>

              <div className="history-actions">
                <button
                  type="button"
                  className="history-action-btn search-again-btn"
                  onClick={() => onSelectCity(item.city)}
                  disabled={isLoading}
                  title={`Refresh weather for ${item.city}`}
                  aria-label={`Refresh weather for ${item.city}`}
                >
                  <RotateCw size={15} />
                </button>

                <button
                  type="button"
                  className="history-action-btn delete-btn"
                  onClick={() => onDeleteItem(item._id)}
                  disabled={isLoading}
                  title={`Delete ${item.city} from history`}
                  aria-label={`Delete ${item.city} from history`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchHistory;