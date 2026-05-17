const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    tags: {
      type: [String],
      default: [],
    },

    category: {
      type: String,
      default: 'General',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'New Note',
    },
    content: {
      type: String,
      required: true,
    },
    aiSummary: {
      type: String,
    },
    lastSummarizedAt: {
      type: Date,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },

    shareId: {
      type: String,
    },
    aiActionItems: {
      type: [String],
      default: [],
    },

    aiSuggestedTitle: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Note', noteSchema);
