const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const Report = require("../models/Report");
const requireAuth = require("../middleware/auth");
const cloudinary  = require("../configs/Cloudinary.js");

const router = express.Router();
const Allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (Allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and Images are allowed"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Helper — returns correct cloudinary options based on mimetype
const getCloudinaryOptions = (mimetype) => {
  if (mimetype === "application/pdf") {
    return { folder: "reports/pdfs", resource_type: "raw", format: "pdf" };
  }
  // images — jpeg, png, webp
  return { folder: "reports/images", resource_type: "image" };
};

router.post("/", requireAuth, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    let extractedText = "";
    if (req.file.mimetype === "application/pdf") {
      const parsed = await pdfParse(req.file.buffer);
      extractedText = parsed.text;
    }

    // Upload with correct options based on file type
    const CloudinaryResult = await new Promise((resolve, reject) => {
      const options = getCloudinaryOptions(req.file.mimetype);
      const stream = cloudinary.uploader.upload_stream(
        options,
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        },
      );
      stream.end(req.file.buffer);
    });

    const report = await Report.create({
      userId: req.session.userId,
      originalName: req.file.originalname,
      url: CloudinaryResult.secure_url,
      public_id: CloudinaryResult.public_id,
      mimeType: req.file.mimetype,
      size: req.file.size,
      extractedText,
    });

    res.status(201).json({
      id: report._id,
      originalName: report.originalName,
      mimeType: report.mimeType,
      size: report.size,
      url: report.url,
      createdAt: report.createdAt,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const reports = await Report.find({ userId: req.session.userId })
      .sort({ createdAt: -1 })
      .select("-extractedText")
      .lean();

    res.json(
      reports.map((r) => ({
        id: r._id,
        originalName: r.originalName,
        mimeType: r.mimeType,
        size: r.size,
        url: r.url,
        createdAt: r.createdAt,
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    // userId is not for uniqueness , it for security Report only be deleted when the _id and userId both known
    const report = await Report.findOneAndDelete({
      _id: req.params.id,
      userId: req.session.userId,
    });
    if (!report) return res.status(404).json({ error: "Report not found" });

    const resource_type =
      report.mimeType === "application/pdf" ? "raw" : "image";
    await cloudinary.uploader.destroy(report.public_id, { resource_type });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
