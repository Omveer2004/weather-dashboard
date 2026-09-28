import React, { useState } from 'react';
import { Search, MapPin, X, Loader2 } from 'lucide-react';

const POPULAR_CITIES = ['Delhi', 'Mumbai', 'Lucknow', 'Indore', 'Kanpur', 'Bhopal'];

const SearchBar = ({ onSearch, onCurrentLocation, isLoading }) => {
  const [query, setQuery] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setValidationError('Please enter a city name.');
      return;
    }
    setValidationError('');
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    setValidationError('');
  };

  const handleQuickCityClick = (city) => {
    setQuery(city);
    setValidationError('');
    onSearch(city);
  };

  return (
    <div className="search-section">
      <form onSubmit={handleSubmit} className="search-form" role="search">
        <div className="search-input-wrapper">
          <Search className="search-icon-decor" size={20} />
          <input
            type="text"
            className="search-input"
            placeholder="Enter city name... (e.g. Delhi, Mumbai,Lucknow)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (validationError) setValidationError('');
            }}
            disabled={isLoading}
            aria-label="City name"
            autoComplete="off"
          />
          {query && !isLoading && (
            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
              aria-label="Clear search input"
              title="Clear text"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="search-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isLoading || !query.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="spinner" size={18} />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search size={18} />
                <span>Search</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-location"
            onClick={onCurrentLocation}
            disabled={isLoading}
            title="Use My Current Location via GPS"
            aria-label="Use My Location"
          >
            <MapPin size={18} />
            <span className="location-btn-text">My Location</span>
          </button>
        </div>
      </form>

      {validationError && (
        <p className="search-inline-error" role="alert">
          {validationError}
        </p>
      )}

      {/* Quick Suggestion Pills */}
      <div className="quick-cities">
        <span className="quick-label">Suggestions:</span>
        <div className="quick-chips">
          {POPULAR_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              className="quick-chip-btn"
              onClick={() => handleQuickCityClick(city)}
              disabled={isLoading}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;