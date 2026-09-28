import express from 'express';
import { getWeather, getWeatherForCoordinates } from '../controllers/weatherController.js';

const router = express.Router();

// Geolocation weather route (placed before :city so "coordinates" isn't treated as a city name)
router.get('/coordinates', getWeatherForCoordinates);

// City weather route
router.get('/:city', getWeather);

export default router;
