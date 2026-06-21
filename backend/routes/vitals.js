const express = require('express');
const router = express.Router();
const Vital = require('../models/Vital');
const auth = require('../middleware/auth');

// @route   POST api/vitals
// @desc    Log a new set of vitals
router.post('/', auth, async (req, res) => {
  const { heartRate, systolic, diastolic, temperature, spo2, respiratoryRate, bloodSugar } = req.body;

  try {
    if (!heartRate || !systolic || !diastolic || !temperature || !spo2) {
      return res.status(400).json({ message: 'Please provide all core vitals (HR, BP Systolic/Diastolic, Temp, SpO2).' });
    }

    const newVital = await Vital.create({
      userId: req.user.id,
      heartRate: Number(heartRate),
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      temperature: Number(temperature),
      spo2: Number(spo2),
      respiratoryRate: respiratoryRate ? Number(respiratoryRate) : null,
      bloodSugar: bloodSugar ? Number(bloodSugar) : null
    });

    res.status(201).json({
      message: 'Vitals logged successfully!',
      vital: newVital
    });

  } catch (err) {
    console.error('Vitals logging error:', err);
    res.status(500).json({ message: 'Server error logging vitals.' });
  }
});

// @route   GET api/vitals
// @desc    Get all vital logs for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const vitals = await Vital.find({ userId: req.user.id }, { createdAt: -1 });
    res.json(vitals);
  } catch (err) {
    console.error('Vitals fetching error:', err);
    res.status(500).json({ message: 'Server error retrieving vitals history.' });
  }
});

// @route   DELETE api/vitals
// @desc    Clear vitals history for logged-in user
router.delete('/', auth, async (req, res) => {
  try {
    await Vital.deleteMany({ userId: req.user.id });
    res.json({ message: 'Vitals history cleared successfully.' });
  } catch (err) {
    console.error('Vitals clearing error:', err);
    res.status(500).json({ message: 'Server error clearing vitals history.' });
  }
});

module.exports = router;
