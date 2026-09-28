import { getWeatherByCity, getWeatherByCoordinates } from '../services/weatherService.js';
import SearchHistory from '../models/SearchHistory.js';
import mongoose from 'mongoose';

/**
 * Controller: Get Weather for City
 * Route: GET /api/weather/:city
 */
export const getWeather = async (req, res) => {
  try {
    const rawCity = req.params.city;

    // 1. Input Validation
    if (!rawCity || typeof rawCity !== 'string' || rawCity.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a city name.',
      });
    }

    const city = rawCity.trim();

    // 2. Fetch Weather Data from Service
    const weatherData = await getWeatherByCity(city);

    // 3. Save Search History to MongoDB (with duplicate check / graceful degradation)
    if (mongoose.connection.readyState === 1) {
      try {
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        
        // Check if same city was recently searched
        const existingRecord = await SearchHistory.findOne({
          city: new RegExp(`^${weatherData.city}$`, 'i'),
          country: weatherData.country,
          searchedAt: { $gte: tenMinutesAgo },
        });

        if (existingRecord) {
          // Update timestamp and latest metrics
          existingRecord.searchedAt = new Date();
          existingRecord.temperature = weatherData.temperature;
          existingRecord.weatherCondition = weatherData.condition;
          existingRecord.weatherDescription = weatherData.description;
          existingRecord.icon = weatherData.icon;
          existingRecord.feelsLike = weatherData.feelsLike;
          existingRecord.humidity = weatherData.humidity;
          existingRecord.windSpeed = weatherData.windSpeed;
          await existingRecord.save();
        } else {
          // Create new history entry
          await SearchHistory.create({
            city: weatherData.city,
            country: weatherData.country,
            temperature: weatherData.temperature,
            weatherCondition: weatherData.condition,
            weatherDescription: weatherData.description,
            icon: weatherData.icon,
            feelsLike: weatherData.feelsLike,
            humidity: weatherData.humidity,
            windSpeed: weatherData.windSpeed,
            searchedAt: new Date(),
          });
        }
      } catch (dbError) {
        console.warn(`[MongoDB Warning] Could not record search history: ${dbError.message}`);
      }
    }

    // 4. Return Clean Sanitized Weather Data
    return res.status(200).json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    if (error.statusCode === 404 || error.response?.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'City not found. Please check the city name and try again.',
      });
    }

    console.error(`[WeatherController Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch weather data. Please try again later.',
    });
  }
};

/**
 * Controller: Get Weather for Current Geolocation Coordinates
 * Route: GET /api/weather/coordinates?lat=...&lon=...
 */
export const getWeatherForCoordinates = async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon || isNaN(Number(lat)) || isNaN(Number(lon))) {
      return res.status(400).json({
        success: false,
        message: 'Valid latitude and longitude coordinates are required.',
      });
    }

    const weatherData = await getWeatherByCoordinates(Number(lat), Number(lon));

    return res.status(200).json({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    console.error(`[Coordinates Error] ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch weather data for your current location. Please try again later.',
    });
  }
};
