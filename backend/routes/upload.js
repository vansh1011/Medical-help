const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const pdfParse = require('pdf-parse');
const Report = require('../models/Report');
const requireAuth = require('../middleware/auth');

const router = express.Router();


const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
   
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
  },
});

const ALLOWED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.includes(file.mimetype)) {
      return cb(new Error('Only PDF, JPG, PNG, or WEBP files are allowed'));
    }
    cb(null, true);
  },
});


router.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

   
    let extractedText = '';
    if (req.file.mimetype === 'application/pdf') {
      try {
        const buffer = fs.readFileSync(req.file.path);
        const parsed = await pdfParse(buffer);
        extractedText = parsed.text || '';
      } catch (e) {
        console.warn('PDF parse failed:', e.message);
      }
    }

    const report = await Report.create({
      userId: req.session.userId,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extractedText,
    });

    res.status(201).json({
      id: report._id,
      originalName: report.originalName,
      mimeType: report.mimeType,
      size: report.size,
      url: `/uploads/${report.storedName}`,
      createdAt: report.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const reports = await Report.find({ userId: req.session.userId })
      .sort({ createdAt: -1 })
      .select('-extractedText') 
      .lean();

    res.json(
      reports.map((r) => ({
        id: r._id,
        originalName: r.originalName,
        mimeType: r.mimeType,
        size: r.size,
        url: `/uploads/${r.storedName}`,
        createdAt: r.createdAt,
      }))
    );
  } catch (err) {
    next(err);
  }
});


router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId,
    });
    if (!report) return res.status(404).json({ error: 'Report not found' });

 
    const filePath = path.join(uploadDir, report.storedName);
    fs.unlink(filePath, () => {});
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
