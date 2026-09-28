import mongoose from 'mongoose';

/**
 * SearchHistory Schema
 * Stores historical weather search records for quick access and analytics
 */
const searchHistorySchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: [true, 'City name is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country name/code is required'],
      trim: true,
    },
    searchedAt: {
      type: Date,
      default: Date.now,
    },
    temperature: {
      type: Number,
      default: null,
    },
    weatherCondition: {
      type: String,
      trim: true,
      default: '',
    },
    weatherDescription: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    feelsLike: {
      type: Number,
      default: null,
    },
    humidity: {
      type: Number,
      default: null,
    },
    windSpeed: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for high performance retrieval of latest searches
searchHistorySchema.index({ searchedAt: -1 });
searchHistorySchema.index({ city: 1, country: 1 });

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

export default SearchHistory;
