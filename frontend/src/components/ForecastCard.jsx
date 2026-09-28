import React from 'react';
import { CalendarDays } from 'lucide-react';

const formatTemp = (celsius, unit) => {
  if (celsius === null || celsius === undefined) return '--';
  if (unit === 'imperial') {
    return `${Math.round((celsius * 9) / 5 + 32)}°`;
  }
  return `${Math.round(celsius)}°`;
};

const formatDay = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const today = new Date().toISOString().split('T')[0];
  if (dateStr === today) return 'Today';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
};

const ForecastCard = ({ forecast, unit }) => {
  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="forecast-container">
      <div className="forecast-header">
        <CalendarDays size={18} className="forecast-header-icon" />
        <h3 className="section-title">5-Day Forecast</h3>
      </div>

      <div className="forecast-grid">
        {forecast.map((item, index) => (
          <div key={index} className="forecast-item">
            <span className="forecast-day">{formatDay(item.date)}</span>
            <div className="forecast-icon-box">
              <img
                src={item.iconUrl}
                alt={item.condition}
                className="forecast-icon"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <span className="forecast-condition" title={item.description}>
              {item.condition}
            </span>
            <div className="forecast-temps">
              <span className="temp-high">{formatTemp(item.tempMax, unit)}</span>
              <span className="temp-low">{formatTemp(item.tempMin, unit)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastCard;