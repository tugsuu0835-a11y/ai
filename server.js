import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from '@google/genai';

const app = express();
app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const MODEL = 'gemini-3.5-flash';
const MAX_CHARS = 30000;

// Холболтын төлөв шалгах (AI дуудахгүй, зардалгүй)
app.get('/api/health', (req, res) => {
  res.json({ ok: true, configured: Boolean(process.env.GEMINI_API_KEY) });
});

app.post('/api/chat', async (req, res) => {
  const { message, system } = req.body;

  if (!message || typeof message !== 'string' || message.length > MAX_CHARS) {
    return res.status(400).json({ error: 'message field is required (max 30000 chars)' });
  }
  if (system !== undefined && typeof system !== 'string') {
    return res.status(400).json({ error: 'system must be a string' });
  }

  try {
    const config = system ? { systemInstruction: system } : {};
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: message,
      config: config,
    });

    res.json({ reply: response.text });
  } catch (err) {
    console.error('AI error:', err.message);
    res.status(500).json({ error: 'AI серверийн алдаа гарлаа. Terminal-ийн логийг шалгана уу.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server running at http://localhost:' + PORT);
});