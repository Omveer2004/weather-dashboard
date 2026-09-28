import React from 'react';
import {
  Droplets,
  Wind,
  Gauge,
  Eye,
  Thermometer,
  Sunrise,
  Sunset,
} from 'lucide-react';

const formatTemp = (celsius, unit) => {
  if (celsius === null || celsius === undefined) return '--';
  if (unit === 'imperial') {
    return `${Math.round((celsius * 9) / 5 + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
};

const formatTime = (epochSeconds) => {
  if (!epochSeconds) return '--:--';
  const date = new Date(epochSeconds * 1000);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getHumidityDescription = (humidity) => {
  if (humidity < 30) return 'Dry atmospheric air';
  if (humidity <= 60) return 'Comfortable humidity';
  if (humidity <= 80) return 'Moderately humid';
  return 'High humidity';
};

const getWindDirectionLabel = (deg) => {
  if (deg === undefined || deg === null) return '';
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(deg / 45) % 8;
  return directions[index];
};

const WeatherStats = ({ weather, unit }) => {
  if (!weather) return null;

  const {
    feelsLike,
    humidity,
    windSpeed,
    windDirection,
    pressure,
    visibility,
    sunrise,
    sunset,
  } = weather;

  const windKmH = windSpeed ? (windSpeed * 3.6).toFixed(1) : '0';
  const windDirText = getWindDirectionLabel(windDirection);

  const statsList = [
    {
      id: 'feels-like',
      label: 'Feels Like',
      value: formatTemp(feelsLike, unit),
      subtext: 'Thermal perception',
      icon: <Thermometer className="stat-card-icon icon-amber" size={24} />,
    },
    {
      id: 'humidity',
      label: 'Humidity',
      value: `${humidity ?? '--'}%`,
      subtext: getHumidityDescription(humidity),
      icon: <Droplets className="stat-card-icon icon-blue" size={24} />,
    },
    {
      id: 'wind',
      label: 'Wind Speed',
      value: `${windSpeed ?? '--'} m/s`,
      subtext: `${windKmH} km/h ${windDirText ? `• ${windDirText}` : ''}`,
      icon: <Wind className="stat-card-icon icon-teal" size={24} />,
    },
    {
      id: 'pressure',
      label: 'Pressure',
      value: `${pressure ?? '--'} hPa`,
      subtext: pressure >= 1013 ? 'High pressure system' : 'Low pressure system',
      icon: <Gauge className="stat-card-icon icon-indigo" size={24} />,
    },
    {
      id: 'visibility',
      label: 'Visibility',
      value: `${visibility ?? '--'} km`,
      subtext: visibility >= 10 ? 'Optimal clear visibility' : 'Hazy atmospheric air',
      icon: <Eye className="stat-card-icon icon-purple" size={24} />,
    },
    {
      id: 'sun',
      label: 'Solar Cycle',
      value: formatTime(sunrise),
      subtext: `Sunset: ${formatTime(sunset)}`,
      icon: <Sunrise className="stat-card-icon icon-yellow" size={24} />,
    },
  ];

  return (
    <div className="weather-stats-container">
      <h3 className="section-title">Atmospheric Conditions</h3>
      <div className="stats-grid">
        {statsList.map((stat) => (
          <div key={stat.id} className="stat-card">
            <div className="stat-card-top">
              <span className="stat-label">{stat.label}</span>
              <div className="stat-icon-wrapper">{stat.icon}</div>
            </div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-subtext">{stat.subtext}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherStats;
