import SearchHistory from '../models/SearchHistory.js';
import mongoose from 'mongoose';

/**
 * Controller: Get Search History
 * Route: GET /api/history
 */
export const getHistory = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        note: 'Database temporarily unavailable',
      });
    }

    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const history = await SearchHistory.find()
      .sort({ searchedAt: -1 })
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    console.error(`[HistoryController Error] getHistory: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve search history.',
    });
  }
};

/**
 * Controller: Delete a single history record
 * Route: DELETE /api/history/:id
 */
export const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid history record ID format.',
      });
    }

    const record = await SearchHistory.findByIdAndDelete(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Search history record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Search history record for ${record.city} successfully deleted.`,
      data: { id: record._id },
    });
  } catch (error) {
    console.error(`[HistoryController Error] deleteHistoryItem: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete search history record.',
    });
  }
};

/**
 * Controller: Clear all search history records
 * Route: DELETE /api/history
 */
export const clearHistory = async (req, res) => {
  try {
    const result = await SearchHistory.deleteMany({});

    return res.status(200).json({
      success: true,
      message: 'All search history has been cleared successfully.',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error(`[HistoryController Error] clearHistory: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear search history.',
    });
  }
};
