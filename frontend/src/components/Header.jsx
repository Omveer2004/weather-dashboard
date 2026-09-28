import React from 'react';
import { CloudSun, Moon, Sun } from 'lucide-react';

const Header = ({ unit, onToggleUnit, theme, onToggleTheme }) => {
  return (
    <header className="header-container">
      <div className="header-brand">
        <div className="brand-logo">
          <CloudSun className="brand-icon" size={32} />
        </div>
        <div className="brand-text">
          <h1 className="brand-title">Weather Dashboard</h1>
          <p className="brand-subtitle">
            Check current weather conditions for any city around the world.
          </p>
        </div>
      </div>

      <div className="header-actions">
        {/* Unit Toggle Button */}
        <button
          type="button"
          onClick={onToggleUnit}
          className="header-btn unit-toggle"
          title={`Switch to ${unit === 'metric' ? 'Fahrenheit (°F)' : 'Celsius (°C)'}`}
          aria-label="Toggle Temperature Unit"
        >
          <span className={`unit-chip ${unit === 'metric' ? 'active' : ''}`}>°C</span>
          <span className="unit-divider">/</span>
          <span className={`unit-chip ${unit === 'imperial' ? 'active' : ''}`}>°F</span>
        </button>

        {/* Dark / Light Mode Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="header-btn theme-toggle"
          title={`Switch to ${theme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            <Sun className="theme-icon sun-icon" size={20} />
          ) : (
            <Moon className="theme-icon moon-icon" size={20} />
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;