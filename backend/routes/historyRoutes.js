import express from 'express';
import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} from '../controllers/historyController.js';

const router = express.Router();

// Get search history list & clear all history
router.route('/')
  .get(getHistory)
  .delete(clearHistory);

// Delete single history entry by ID
router.route('/:id')
  .delete(deleteHistoryItem);

export default router;
