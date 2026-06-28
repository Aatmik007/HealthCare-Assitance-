const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Vital = require('../models/Vital');
const MedicalReport = require('../models/MedicalReport');
const { generateRecommendations } = require('../services/recommendationsService');

// @route   GET api/recommendations
// @desc    Generate personalized medical recommendations for the user
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User profile not found.' });
    }

    // Get latest vitals log
    const vitals = await Vital.find({ userId: req.user.id }, { createdAt: -1 });
    const latestVital = vitals.length > 0 ? vitals[0] : null;

    // Get reports (including parsed lab readings)
    const reports = await MedicalReport.find({ userId: req.user.id }, { createdAt: -1 });

    // Generate tailored clinical suggestions
    const recs = generateRecommendations(user, latestVital, reports);

    res.json({
      latestVitalLogged: !!latestVital,
      recommendationsCount: recs.length,
      recommendations: recs
    });

  } catch (err) {
    console.error('Recommendations API error:', err);
    res.status(500).json({ message: 'Server error generating recommendations.' });
  }
});

module.exports = router;
