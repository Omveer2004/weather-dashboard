# Weather Dashboard — Full-Stack Web Application

A modern, responsive, production-style **Weather Dashboard** built with **React (Vite)**, **Node.js/Express**, and **MongoDB (Mongoose)**. This project allows users to search for live weather updates worldwide, view comprehensive atmospheric metrics and 5-day forecasts, persist search history in MongoDB, and toggle between temperature units and themes.

---

## Features

### 1. Weather Search

- **Instant City Search**: Search current weather for any city worldwide with input validation and loading indicators.
- **Debounced / Duplicate Protection**: Prevents duplicate requests while fetching.
- **Quick City Suggestion Pills**: 1-click access to popular global cities (Delhi, Mumbai, Kanpur, Indore, Lucknow, Bhopal).
- **Clear Input Action**: Fast clear `(X)` button when typing.

### 2. Rich Current Weather Display

- **Live Temperatures**: Current temperature, "Feels Like" thermal perception, and Daily High / Low range.
- **Atmospheric Conditions**: Weather condition title, description, and high-resolution weather icon.
- **Location Badge**: City name with country badge and formatted date/time.

### 3. Atmospheric Statistics Grid

- **Thermal Perception**: Feels-like calculation with comfort interpretation.
- **Humidity**: Relative humidity percentage with comfort scale description.
- **Wind Dynamics**: Speed in `m/s` and `km/h`, alongside dynamic compass direction (N, NE, SW, etc.).
- **Atmospheric Pressure**: Barometric reading in `hPa` with high/low pressure identification.
- **Visibility**: Distance in kilometers with haze/clarity status.
- **Solar Cycle**: Clean formatted Sunrise and Sunset times.

### 4. 5-Day Weather Forecast

- High-level multi-day forecast cards showing date, weather icon, condition, and projected min/max temperatures.

### 5. Persistent MongoDB Search History

- **Automatic Storage**: Every successful search is automatically recorded in MongoDB.
- **Chronological Ordering**: Sorted with newest searches first.
- **1-Click Search Again**: Click any item in the history list to instantly re-fetch its live weather.
- **Record Deletion**: Remove individual city records from MongoDB.
- **Clear History**: 1-click option to purge all search history with confirmation.
- **Relative Time Tracking**: Real-time relative timestamp ("Just now", "5m ago", "2h ago").

### 6. Geolocation Support ("Use My Location")

- Integrates with the browser's HTML5 Geolocation API to fetch live weather coordinates for the user's current physical location.

### 7. Theming & Customization

- **Dark / Light Mode**: Smooth transition with persistent preference saved to `localStorage`.
- **Dynamic Weather Ambience**: Background gradient subtle shifts depending on current atmospheric conditions (Clear, Clouds, Rain, Thunderstorm, Snow, Fog).
- **Unit Toggle (°C / °F)**: Instant conversion between Celsius and Fahrenheit.

### 8. Robust Error Handling & Graceful Degradation

- **Invalid City**: User-friendly notice: *"City not found. Please check the city name and try again."*
- **Empty Search**: Validated on both client and server: *"Please enter a city name."*
- **API Failure Fallback**: Dual-provider resilience (OpenWeatherMap + live Open-Meteo fallback) so the application works seamlessly out-of-the-box even before an API key is registered.
- **MongoDB Offline Graceful Fallback**: If MongoDB connection is dropped or offline, the app continues serving live weather queries without crashing.

---

## Tech Stack

### Frontend

- **Framework**: React 18
- **Bundler & Tooling**: Vite 5
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Styling**: Modern CSS3 (CSS Custom Properties, Glassmorphism, CSS Grid, Flexbox)

### Backend

- **Runtime**: Node.js (ES Modules)
- **Web Framework**: Express.js
- **Database**: MongoDB via Mongoose
- **HTTP Client**: Axios with request timeout safeguards (8000ms)
- **Security & Config**: dotenv, cors

---

## Environment Variables

### Backend `.env` (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/weather_dashboard
WEATHER_API_KEY=your_openweathermap_api_key_here
