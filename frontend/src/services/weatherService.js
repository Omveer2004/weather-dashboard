import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const handleApiError = (error) => {
  if (error.response) {
    const message = error.response.data?.message || 'Failed to process request.';
    const status = error.response.status;
    const customError = new Error(message);
    customError.status = status;
    throw customError;
  } else if (error.request) {
    const customError = new Error(
      'Unable to connect to the backend server. Please check your internet connection or verify the server is running on port 5000.'
    );
    customError.status = 0;
    throw customError;
  } else {
    throw new Error(error.message || 'An unexpected error occurred.');
  }
};

export const fetchWeatherByCity = async (city) => {
  try {
    const encodedCity = encodeURIComponent(city.trim());
    const response = await api.get(`/weather/${encodedCity}`);
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchWeatherByCoords = async (lat, lon) => {
  try {
    const response = await api.get(`/weather/coordinates`, {
      params: { lat, lon },
    });
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const fetchSearchHistory = async (limit = 10) => {
  try {
    const response = await api.get('/history', {
      params: { limit },
    });
    return response.data.data || [];
  } catch (error) {
    console.warn('[Frontend Service] History retrieval warning:', error.message);
    return [];
  }
};

export const deleteHistoryItem = async (id) => {
  try {
    const response = await api.delete(`/history/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const clearAllHistory = async () => {
  try {
    const response = await api.delete('/history');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

