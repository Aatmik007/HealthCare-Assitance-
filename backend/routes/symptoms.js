const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSymptomPrediction, SYMPTOMS_LIST } = require('../services/mlServiceClient');

// @route   GET api/symptoms
// @desc    Get the list of recognized symptoms
router.get('/', (req, res) => {
  res.json(SYMPTOMS_LIST);
});

// @route   POST api/symptoms/predict
// @desc    Predict disease from symptom indices
router.post('/predict', auth, async (req, res) => {
  const { symptomIndices, classifier } = req.body;

  try {
    if (!symptomIndices || !Array.isArray(symptomIndices) || symptomIndices.length === 0) {
      return res.status(400).json({ message: 'Please select at least one symptom for classification.' });
    }

    // Verify all indices are valid integers
    const validIndices = symptomIndices.map(Number).filter(n => !isNaN(n) && n >= 0 && n < SYMPTOMS_LIST.length);
    if (validIndices.length === 0) {
      return res.status(400).json({ message: 'No valid symptom indices provided.' });
    }

    const prediction = await getSymptomPrediction(validIndices, classifier || 'random_forest');
    res.json(prediction);

  } catch (err) {
    console.error('Symptom prediction route error:', err);
    res.status(500).json({ message: 'Server error analyzing symptom profile.' });
  }
});

module.exports = router;
