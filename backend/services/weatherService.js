import axios from 'axios';

// HTTP client with timeout protection
const apiClient = axios.create({
  timeout: 8000,
});

/**
 * Maps WMO weather interpretation codes (used by Open-Meteo) to standard conditions and icons
 */
const mapWmoCode = (code, isDay = 1) => {
  const d = isDay ? 'd' : 'n';
  if (code === 0) {
    return { condition: 'Clear', description: 'clear sky', icon: `01${d}` };
  }
  if (code === 1) {
    return { condition: 'Mainly Clear', description: 'mainly clear sky', icon: `01${d}` };
  }
  if (code === 2) {
    return { condition: 'Partly Cloudy', description: 'partly cloudy', icon: `02${d}` };
  }
  if (code === 3) {
    return { condition: 'Overcast', description: 'overcast clouds', icon: `04${d}` };
  }
  if (code >= 45 && code <= 48) {
    return { condition: 'Fog', description: 'fog and depositing rime fog', icon: `50${d}` };
  }
  if (code >= 51 && code <= 57) {
    return { condition: 'Drizzle', description: 'light drizzle', icon: `09${d}` };
  }
  if (code >= 61 && code <= 65) {
    return { condition: 'Rain', description: 'rain showers', icon: `10${d}` };
  }
  if (code >= 66 && code <= 67) {
    return { condition: 'Freezing Rain', description: 'freezing rain', icon: `13${d}` };
  }
  if (code >= 71 && code <= 77) {
    return { condition: 'Snow', description: 'snowfall', icon: `13${d}` };
  }
  if (code >= 80 && code <= 82) {
    return { condition: 'Rain', description: 'heavy rain showers', icon: `09${d}` };
  }
  if (code >= 85 && code <= 86) {
    return { condition: 'Snow', description: 'snow showers', icon: `13${d}` };
  }
  if (code >= 95 && code <= 99) {
    return { condition: 'Thunderstorm', description: 'thunderstorm with rain', icon: `11${d}` };
  }
  return { condition: 'Clouds', description: 'cloudy', icon: `03${d}` };
};

/**
 * Fetches weather data using Open-Meteo (No API key required, reliable live public API)
 * Used as a reliable fallback or out-of-the-box demo when OpenWeatherMap key is not yet set
 */
const fetchFromOpenMeteo = async (city) => {
  // 1. Geocode city name to coordinates
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;
  const geoRes = await apiClient.get(geoUrl);

  if (!geoRes.data.results || geoRes.data.results.length === 0) {
    const error = new Error('City not found. Please check the city name and try again.');
    error.statusCode = 404;
    throw error;
  }

  const location = geoRes.data.results[0];
  const { latitude, longitude, name, country_code, country } = location;

  // 2. Fetch current weather and daily forecast
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
  const weatherRes = await apiClient.get(weatherUrl);
  const { current, daily } = weatherRes.data;

  const wmoInfo = mapWmoCode(current.weather_code, current.is_day);

  // Build 5-day daily forecast summary
  const forecast = [];
  if (daily && daily.time) {
    for (let i = 0; i < Math.min(5, daily.time.length); i++) {
      const dayWmo = mapWmoCode(daily.weather_code[i], 1);
      forecast.push({
        date: daily.time[i],
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        condition: dayWmo.condition,
        description: dayWmo.description,
        icon: dayWmo.icon,
        iconUrl: `https://openweathermap.org/img/wn/${dayWmo.icon}@2x.png`,
      });
    }
  }

  return {
    city: name,
    country: country_code ? country_code.toUpperCase() : (country || 'N/A'),
    coord: { lat: latitude, lon: longitude },
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    tempMin: daily?.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : Math.round(current.temperature_2m - 3),
    tempMax: daily?.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : Math.round(current.temperature_2m + 3),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Number((current.wind_speed_10m / 3.6).toFixed(1)), // convert km/h to m/s
    windDirection: current.wind_direction_10m || 0,
    pressure: Math.round(current.surface_pressure),
    visibility: 10, // km standard default
    condition: wmoInfo.condition,
    description: wmoInfo.description,
    icon: wmoInfo.icon,
    iconUrl: `https://openweathermap.org/img/wn/${wmoInfo.icon}@2x.png`,
    sunrise: daily?.sunrise ? new Date(daily.sunrise[0]).getTime() / 1000 : null,
    sunset: daily?.sunset ? new Date(daily.sunset[0]).getTime() / 1000 : null,
    provider: 'Open-Meteo (Live Global Weather)',
    forecast,
  };
};

/**
 * Fetches coordinates weather using Open-Meteo
 */
const fetchCoordinatesFromOpenMeteo = async (lat, lon) => {
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`;
  const weatherRes = await apiClient.get(weatherUrl);
  const { current, daily } = weatherRes.data;

  // Reverse geocode to find city name
  let cityName = 'Current Location';
  let countryCode = '';
  try {
    const revGeoUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    const revGeoRes = await apiClient.get(revGeoUrl, {
      headers: { 'User-Agent': 'WeatherDashboard-InternshipProject/1.0' },
    });
    if (revGeoRes.data && revGeoRes.data.address) {
      cityName = revGeoRes.data.address.city || revGeoRes.data.address.town || revGeoRes.data.address.village || revGeoRes.data.address.county || 'Current Location';
      countryCode = revGeoRes.data.address.country_code ? revGeoRes.data.address.country_code.toUpperCase() : '';
    }
  } catch {
    // Graceful fallback if reverse geocoding is rate limited
  }

  const wmoInfo = mapWmoCode(current.weather_code, current.is_day);

  const forecast = [];
  if (daily && daily.time) {
    for (let i = 0; i < Math.min(5, daily.time.length); i++) {
      const dayWmo = mapWmoCode(daily.weather_code[i], 1);
      forecast.push({
        date: daily.time[i],
        tempMax: Math.round(daily.temperature_2m_max[i]),
        tempMin: Math.round(daily.temperature_2m_min[i]),
        condition: dayWmo.condition,
        description: dayWmo.description,
        icon: dayWmo.icon,
        iconUrl: `https://openweathermap.org/img/wn/${dayWmo.icon}@2x.png`,
      });
    }
  }

  return {
    city: cityName,
    country: countryCode || 'LOCAL',
    coord: { lat: Number(lat), lon: Number(lon) },
    temperature: Math.round(current.temperature_2m),
    feelsLike: Math.round(current.apparent_temperature),
    tempMin: daily?.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : Math.round(current.temperature_2m - 3),
    tempMax: daily?.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : Math.round(current.temperature_2m + 3),
    humidity: Math.round(current.relative_humidity_2m),
    windSpeed: Number((current.wind_speed_10m / 3.6).toFixed(1)),
    windDirection: current.wind_direction_10m || 0,
    pressure: Math.round(current.surface_pressure),
    visibility: 10,
    condition: wmoInfo.condition,
    description: wmoInfo.description,
    icon: wmoInfo.icon,
    iconUrl: `https://openweathermap.org/img/wn/${wmoInfo.icon}@2x.png`,
    sunrise: daily?.sunrise ? new Date(daily.sunrise[0]).getTime() / 1000 : null,
    sunset: daily?.sunset ? new Date(daily.sunset[0]).getTime() / 1000 : null,
    provider: 'Open-Meteo (Live Global Weather)',
    forecast,
  };
};

/**
 * Fetches weather data using OpenWeatherMap API
 */
const fetchFromOpenWeatherMap = async (city, apiKey) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
  const response = await apiClient.get(url);
  const data = response.data;

  // Also attempt to fetch 5-day forecast for bonus UI feature
  let forecast = [];
  try {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`;
    const forecastRes = await apiClient.get(forecastUrl);
    if (forecastRes.data && forecastRes.data.list) {
      // Pick one forecast reading per day (e.g. around 12:00:00)
      const dailyMap = {};
      forecastRes.data.list.forEach((item) => {
        const dateStr = item.dt_txt.split(' ')[0];
        if (!dailyMap[dateStr] || item.dt_txt.includes('12:00:00')) {
          dailyMap[dateStr] = {
            date: dateStr,
            tempMax: Math.round(item.main.temp_max),
            tempMin: Math.round(item.main.temp_min),
            condition: item.weather[0]?.main || 'Clouds',
            description: item.weather[0]?.description || '',
            icon: item.weather[0]?.icon || '01d',
            iconUrl: `https://openweathermap.org/img/wn/${item.weather[0]?.icon || '01d'}@2x.png`,
          };
        }
      });
      forecast = Object.values(dailyMap).slice(0, 5);
    }
  } catch {
    // Non-critical if forecast fails
  }

  return {
    city: data.name,
    country: data.sys?.country || 'N/A',
    coord: { lat: data.coord?.lat, lon: data.coord?.lon },
    temperature: Math.round(data.main?.temp),
    feelsLike: Math.round(data.main?.feels_like),
    tempMin: Math.round(data.main?.temp_min),
    tempMax: Math.round(data.main?.temp_max),
    humidity: data.main?.humidity,
    windSpeed: data.wind?.speed,
    windDirection: data.wind?.deg || 0,
    pressure: data.main?.pressure,
    visibility: data.visibility ? Math.round(data.visibility / 1000) : 10, // convert meters to km
    condition: data.weather[0]?.main || 'Unknown',
    description: data.weather[0]?.description || '',
    icon: data.weather[0]?.icon || '01d',
    iconUrl: `https://openweathermap.org/img/wn/${data.weather[0]?.icon || '01d'}@2x.png`,
    sunrise: data.sys?.sunrise,
    sunset: data.sys?.sunset,
    provider: 'OpenWeatherMap',
    forecast,
  };
};

/**
 * Fetches coordinates weather using OpenWeatherMap API
 */
const fetchCoordinatesFromOpenWeatherMap = async (lat, lon, apiKey) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
  const response = await apiClient.get(url);
  const data = response.data;

  let forecast = [];
  try {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    const forecastRes = await apiClient.get(forecastUrl);
    if (forecastRes.data && forecastRes.data.list) {
      const dailyMap = {};
      forecastRes.data.list.forEach((item) => {
        const dateStr = item.dt_txt.split(' ')[0];
        if (!dailyMap[dateStr] || item.dt_txt.includes('12:00:00')) {
          dailyMap[dateStr] = {
            date: dateStr,
            tempMax: Math.round(item.main.temp_max),
            tempMin: Math.round(item.main.temp_min),
            condition: item.weather[0]?.main || 'Clouds',
            description: item.weather[0]?.description || '',
            icon: item.weather[0]?.icon || '01d',
            iconUrl: `https://openweathermap.org/img/wn/${item.weather[0]?.icon || '01d'}@2x.png`,
          };
        }
      });
      forecast = Object.values(dailyMap).slice(0, 5);
    }
  } catch {
    // Ignore forecast error
  }

  return {
    city: data.name || 'Current Location',
    country: data.sys?.country || 'LOCAL',
    coord: { lat: data.coord?.lat || lat, lon: data.coord?.lon || lon },
    temperature: Math.round(data.main?.temp),
    feelsLike: Math.round(data.main?.feels_like),
    tempMin: Math.round(data.main?.temp_min),
    tempMax: Math.round(data.main?.temp_max),
    humidity: data.main?.humidity,
    windSpeed: data.wind?.speed,
    windDirection: data.wind?.deg || 0,
    pressure: data.main?.pressure,
    visibility: data.visibility ? Math.round(data.visibility / 1000) : 10,
    condition: data.weather[0]?.main || 'Unknown',
    description: data.weather[0]?.description || '',
    icon: data.weather[0]?.icon || '01d',
    iconUrl: `https://openweathermap.org/img/wn/${data.weather[0]?.icon || '01d'}@2x.png`,
    sunrise: data.sys?.sunrise,
    sunset: data.sys?.sunset,
    provider: 'OpenWeatherMap',
    forecast,
  };
};

/**
 * Primary public method: Get weather by city name
 */
export const getWeatherByCity = async (city) => {
  const apiKey = process.env.WEATHER_API_KEY?.trim();

  // If a valid key is provided, attempt OpenWeatherMap first
  if (apiKey && apiKey !== 'your_weather_api_key' && apiKey !== 'your_api_key') {
    try {
      return await fetchFromOpenWeatherMap(city, apiKey);
    } catch (err) {
      if (err.response?.status === 404) {
        const error = new Error('City not found. Please check the city name and try again.');
        error.statusCode = 404;
        throw error;
      }
      // If 401 (invalid/inactive key) or other OWM API issue, log and fall back to Open-Meteo
      console.warn(`[WeatherService] OpenWeatherMap request returned ${err.response?.status || err.message}. Falling back to Open-Meteo.`);
    }
  }

  // Fallback to live global Open-Meteo provider
  return await fetchFromOpenMeteo(city);
};

/**
 * Primary public method: Get weather by coordinates (Geolocation)
 */
export const getWeatherByCoordinates = async (lat, lon) => {
  const apiKey = process.env.WEATHER_API_KEY?.trim();

  if (apiKey && apiKey !== 'your_weather_api_key' && apiKey !== 'your_api_key') {
    try {
      return await fetchCoordinatesFromOpenWeatherMap(lat, lon, apiKey);
    } catch (err) {
      console.warn(`[WeatherService] OpenWeatherMap coordinates returned ${err.response?.status || err.message}. Falling back to Open-Meteo.`);
    }
  }

  return await fetchCoordinatesFromOpenMeteo(lat, lon);
};
