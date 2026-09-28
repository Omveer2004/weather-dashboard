import React from 'react';
import {
  MapPin,
  Calendar,
  ArrowUp,
  ArrowDown,
  Info,
  Thermometer,
} from 'lucide-react';

const formatTemp = (celsius, unit) => {
  if (celsius === null || celsius === undefined) return '--';
  if (unit === 'imperial') {
    const fahr = Math.round((celsius * 9) / 5 + 32);
    return `${fahr}°F`;
  }
  return `${Math.round(celsius)}°C`;
};

const formatDate = (timestamp) => {
  const date = timestamp ? new Date(timestamp * 1000) : new Date();
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const WeatherCard = ({ weather, unit }) => {
  if (!weather) return null;

  const {
    city,
    country,
    temperature,
    feelsLike,
    tempMin,
    tempMax,
    condition,
    description,
    iconUrl,
    provider,
  } = weather;

  return (
    <div className="weather-card animate-fade-in">
      <div className="card-header">
        <div className="location-info">
          <div className="city-title-row">
            <MapPin className="pin-icon" size={24} />
            <h2 className="city-name">{city}</h2>
            <span className="country-badge">{country}</span>
          </div>
          <p className="current-date">
            <Calendar size={14} className="calendar-icon" />
            <span>{formatDate()}</span>
          </p>
        </div>

        {provider && (
          <div className="provider-pill" title="Live meteorological data source">
            <Info size={13} />
            <span>{provider}</span>
          </div>
        )}
      </div>

      <div className="weather-body">
        <div className="temp-display-group">
          <div className="weather-icon-wrapper">
            <img
              src={iconUrl}
              alt={condition}
              className="weather-main-icon"
              loading="eager"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>

          <div className="temp-details">
            <div className="main-temp">{formatTemp(temperature, unit)}</div>
            <div className="condition-label">{condition}</div>
            <div className="description-label">{description}</div>
          </div>
        </div>

        <div className="temp-sub-highlights">
          <div className="sub-highlight-item" title="Feels like temperature">
            <Thermometer size={16} className="sub-icon feels-icon" />
            <span className="sub-label">Feels like:</span>
            <span className="sub-value">{formatTemp(feelsLike, unit)}</span>
          </div>

          <div className="sub-highlight-item" title="Daily High and Low">
            <span className="sub-range-group">
              <ArrowDown size={14} className="range-icon min-icon" />
              <span>{formatTemp(tempMin, unit)}</span>
            </span>
            <span className="sub-divider">|</span>
            <span className="sub-range-group">
              <ArrowUp size={14} className="range-icon max-icon" />
              <span>{formatTemp(tempMax, unit)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;