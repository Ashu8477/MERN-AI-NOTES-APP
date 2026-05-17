const Note = require('../models/Note');

const OLLAMA_URL = 'http://localhost:11434/api/generate';
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// POST /api/ai/notes/:id/summarize
const summarizeNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const prompt = `
Analyze this note and respond in EXACTLY this format:

SUMMARY:
short summary here

ACTION ITEMS:
- task 1
- task 2

TITLE:
short title here

NOTE:
${note.content}
`.trim();

    let rawResponse = '';

    try {
      // TRY OLLAMA FIRST
      const response = await fetch(OLLAMA_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt,
          stream: false,
          options: {
            temperature: 0,
            top_p: 0.8,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Ollama failed');
      }

      const data = await response.json();

      rawResponse = data.response?.trim();
    } catch (err) {
      console.log('Using Gemini fallback...');

      // FALLBACK TO GEMINI
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash-latest',
      });

      const result = await model.generateContent(prompt);

      rawResponse = result.response.text();
    }

    const summaryMatch = rawResponse.match(/SUMMARY:\s*(.*)/i);

    const titleMatch = rawResponse.match(/TITLE:\s*(.*)/i);

    const actionItemsMatch = rawResponse.match(
      /ACTION ITEMS:\s*([\s\S]*?)TITLE:/i,
    );

    const summary = summaryMatch?.[1]?.trim() || 'No summary';

    const suggestedTitle = titleMatch?.[1]?.trim() || note.title;

    const actionItems =
      actionItemsMatch?.[1]
        ?.split('\n')
        .map((item) => item.replace('-', '').trim())
        .filter(Boolean) || [];

    note.aiSummary = summary;

    note.aiSuggestedTitle = suggestedTitle;

    note.aiActionItems = actionItems;

    if (!note.title || note.title === 'New Note') {
      note.title = suggestedTitle;
    }

    note.lastSummarizedAt = new Date();

    await note.save();

    res.json(note);
  } catch (err) {
    console.error('Nano summarize error:', err);
    res.status(500).json({ message: 'Failed to summarize note' });
  }
};

module.exports = { summarizeNote };
