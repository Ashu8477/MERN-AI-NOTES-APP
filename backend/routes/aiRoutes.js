const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { summarizeNote } = require("../controllers/aiController");

const router = express.Router();

/*
  FINAL ROUTE:
  POST /api/ai/notes/:id/summarize
*/
router.post("/notes/:id/summarize", protect, summarizeNote);

module.exports = router;
