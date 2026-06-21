const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const MedicalReport = require('../models/MedicalReport');
const { processReportOCR } = require('../services/ocrService');

// @route   POST api/reports/upload
// @desc    Upload a report image, run OCR, parse metrics, and save
router.post('/upload', auth, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded. Please upload a report image.' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Run OCR and metric parsing
    const { text, parsedVitals } = await processReportOCR(filePath);

    // Save report in Database
    const newReport = await MedicalReport.create({
      userId: req.user.id,
      fileName,
      extractedText: text,
      parsedVitals
    });

    res.status(201).json({
      message: 'Medical report processed and saved successfully!',
      report: newReport
    });

  } catch (err) {
    console.error('Report upload/OCR error:', err);
    res.status(500).json({ message: err.message || 'Server error during report processing.' });
  }
});

// @route   GET api/reports
// @desc    Get report uploads history for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const reports = await MedicalReport.find({ userId: req.user.id }, { createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Reports fetching error:', err);
    res.status(500).json({ message: 'Server error retrieving reports history.' });
  }
});

// @route   DELETE api/reports
// @desc    Clear report history for logged-in user
router.delete('/', auth, async (req, res) => {
  try {
    await MedicalReport.deleteMany({ userId: req.user.id });
    res.json({ message: 'Medical reports history cleared successfully.' });
  } catch (err) {
    console.error('Reports clearing error:', err);
    res.status(500).json({ message: 'Server error clearing reports history.' });
  }
});

module.exports = router;
