const express = require('express');
const {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  getSharedNote,
} = require('../controllers/noteController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/shared/:shareId', getSharedNote);

router.route('/').get(protect, getNotes).post(protect, createNote);

router.route('/:id').put(protect, updateNote).delete(protect, deleteNote);

router.post('/:id/share', protect, shareNote);

module.exports = router;
