const Note = require('../models/Note');
const { v4: uuidv4 } = require('uuid');

// GET /api/notes
const getNotes = async (req, res) => {
  const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notes);
};

// POST /api/notes
const createNote = async (req, res) => {
  const { title, content, tags, category } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Note content required' });
  }

  const note = await Note.create({
    user: req.user._id,
    title,
    content,
    tags,
    category,
  });

  res.status(201).json(note);
};

// PUT /api/notes/:id
const updateNote = async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  if (note.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  note.title = req.body.title || note.title;
  note.content = req.body.content || note.content;
  note.tags = req.body.tags || note.tags;
  note.category = req.body.category || note.category;
  await note.save();

  res.json(note);
};

// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  if (note.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  await note.deleteOne();
  res.json({ message: 'Note removed' });
};

const shareNote = async (req, res) => {
  const note = await Note.findById(req.params.id);

  if (!note) {
    return res.status(404).json({ message: 'Note not found' });
  }

  if (note.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  note.isPublic = true;

  if (!note.shareId) {
    note.shareId = uuidv4();
  }

  await note.save();

  res.json({
    shareUrl: `http://localhost:5173/shared/${note.shareId}`,
  });
};

const getSharedNote = async (req, res) => {
  const note = await Note.findOne({
    shareId: req.params.shareId,
    isPublic: true,
  });

  if (!note) {
    return res.status(404).json({
      message: 'Shared note not found',
    });
  }

  res.json(note);
};

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
  getSharedNote
};
