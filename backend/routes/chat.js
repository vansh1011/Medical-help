const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Message = require('../models/Message');
const Report = require('../models/Report');
const requireAuth = require('../middleware/auth');

const router = express.Router();


const SYSTEM_PROMPT = `You are "Medical Help", a friendly AI medical assistant.
- Provide general health information in plain language.
- Always remind users you are NOT a substitute for a licensed doctor.
- For emergencies, tell the user to seek immediate medical care.
- Be concise, kind, and avoid scary jargon when possible.`;


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.get('/history', requireAuth, async (req, res, next) => {
  try {
    const messages = await Message.find({ userId: req.session.userId })
      .sort({ createdAt: 1 })
      .lean();
    res.json(messages);
  } catch (err) {
    next(err);
  }
});


router.delete('/history', requireAuth, async (req, res, next) => {
  try {
    await Message.deleteMany({ userId: req.session.userId });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});


router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { content, reportId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'content is required' });
    }
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
    }

   
    let userContent = content.trim();
    if (reportId) {
      const report = await Report.findOne({ _id: reportId, userId: req.session.userId });
      if (report && report.extractedText) {
        userContent += `\n\n---\nAttached report ("${report.originalName}"):\n${report.extractedText.slice(0, 15000)}`;
      }
    }

    
   
    await Message.create({
      userId: req.session.userId,
      role: 'user',
      content: content.trim(),
    });

    
    const recent = await Message.find({ userId: req.session.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    const history = recent.reverse(); 

    
    const geminiHistory = history.slice(0, -1).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: SYSTEM_PROMPT,
    });

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(userContent);
    const reply = result.response.text();

    const saved = await Message.create({
      userId: req.session.userId,
      role: 'assistant',
      content: reply,
    });

    res.json({ id: saved._id, role: 'assistant', content: reply, createdAt: saved.createdAt });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
