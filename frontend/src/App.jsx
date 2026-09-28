import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import WeatherCard from './components/WeatherCard';
import WeatherStats from './components/WeatherStats';
import ForecastCard from './components/ForecastCard';
import SearchHistory from './components/SearchHistory';
import Loading from './components/Loading';
import ErrorMessage from './components/ErrorMessage';
import {
  fetchWeatherByCity,
  fetchWeatherByCoords,
  fetchSearchHistory,
  deleteHistoryItem,
  clearAllHistory,
} from './services/weatherService';

function App() {
  const [weather, setWeather] = useState(null);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastSearchedCity, setLastSearchedCity] = useState('');

  // Persisted Unit Preference (°C / °F)
  const [unit, setUnit] = useState(() => {
    return localStorage.getItem('weather_unit') || 'metric';
  });

  // Persisted Theme Preference (Dark / Light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('weather_theme') || 'dark';
  });

  // Load Search History from Backend MongoDB
  const loadHistory = useCallback(async () => {
    try {
      const records = await fetchSearchHistory(10);
      setHistory(records);
    } catch {
      // Non-critical fallback
    }
  }, []);

  // Primary Search Function
  const handleSearch = useCallback(
    async (cityName) => {
      if (!cityName || !cityName.trim()) {
        setError('Please enter a city name.');
        return;
      }

      setIsLoading(true);
      setError('');
      setLastSearchedCity(cityName.trim());

      try {
        const data = await fetchWeatherByCity(cityName.trim());
        setWeather(data);
        setError('');
        await loadHistory();
      } catch (err) {
        setError(err.message || 'Unable to fetch weather data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    },
    [loadHistory]
  );

  // Use My Location (Geolocation API)
  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your current browser.');
      return;
    }

    setIsLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const data = await fetchWeatherByCoords(latitude, longitude);
          setWeather(data);
          setLastSearchedCity(data.city);
          await loadHistory();
        } catch (err) {
          setError(
            err.message ||
              'Unable to fetch weather for your current location. Please try searching by city name.'
          );
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        setIsLoading(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setError('Location permission was denied. Please allow location access or type a city name.');
        } else {
          setError('Unable to retrieve your location coordinates.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  // Delete Individual History Item
  const handleDeleteHistory = async (id) => {
    try {
      await deleteHistoryItem(id);
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      setError('Could not delete history record. Please try again.');
    }
  };

  // Clear Entire Search History
  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear your entire search history?')) {
      try {
        await clearAllHistory();
        setHistory([]);
      } catch (err) {
        setError('Could not clear search history. Please try again.');
      }
    }
  };

  // Toggle Temperature Unit
  const handleToggleUnit = () => {
    setUnit((prev) => {
      const next = prev === 'metric' ? 'imperial' : 'metric';
      localStorage.setItem('weather_unit', next);
      return next;
    });
  };

  // Toggle Theme (Dark / Light)
  const handleToggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('weather_theme', next);
      return next;
    });
  };

  // Sync theme with DOM root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial Load: Fetch default city (London) and search history
  useEffect(() => {
    loadHistory();
    handleSearch('Delhi');
  }, [loadHistory, handleSearch]);

  // Dynamic atmospheric themes
  const getWeatherThemeClass = () => {
    if (!weather) return 'weather-theme-default';
    const condition = weather.condition.toLowerCase();
    if (condition.includes('clear')) return 'weather-theme-clear';
    if (condition.includes('cloud')) return 'weather-theme-clouds';
    if (condition.includes('rain') || condition.includes('drizzle')) return 'weather-theme-rain';
    if (condition.includes('thunder')) return 'weather-theme-thunder';
    if (condition.includes('snow')) return 'weather-theme-snow';
    if (condition.includes('fog') || condition.includes('mist')) return 'weather-theme-fog';
    return 'weather-theme-default';
  };

  return (
    <div className={`app-container ${getWeatherThemeClass()}`}>
      <div className="ambient-glow glow-top-left" />
      <div className="ambient-glow glow-bottom-right" />

      <div className="dashboard-wrapper">
        <Header
          unit={unit}
          onToggleUnit={handleToggleUnit}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        <SearchBar
          onSearch={handleSearch}
          onCurrentLocation={handleCurrentLocation}
          isLoading={isLoading}
        />

        {error && (
          <ErrorMessage
            message={error}
            onDismiss={() => setError('')}
            onRetry={lastSearchedCity ? () => handleSearch(lastSearchedCity) : null}
          />
        )}

        {isLoading && <Loading message={`Fetching weather for "${lastSearchedCity || 'city'}"...`} />}

        {!isLoading && weather && (
          <main className="dashboard-content">
            <div className="weather-overview-grid">
              <div className="primary-column">
                <WeatherCard weather={weather} unit={unit} />
                <ForecastCard forecast={weather.forecast} unit={unit} />
              </div>

              <div className="secondary-column">
                <WeatherStats weather={weather} unit={unit} />
                <SearchHistory
                  history={history}
                  onSelectCity={handleSearch}
                  onDeleteItem={handleDeleteHistory}
                  onClearHistory={handleClearHistory}
                  unit={unit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </main>
        )}

        <footer className="dashboard-footer">
          <p>
            Weather Dashboard Real-time weather information powered by OpenWeather API© 2026 Omveer. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;