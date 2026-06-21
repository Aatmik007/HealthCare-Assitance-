const Tesseract = require('tesseract.js');
const fs = require('fs');

/**
 * Extracts text from an image file using Tesseract.js OCR.
 * @param {string} filePath - Absolute path to the uploaded image.
 * @returns {Promise<string>} - Extracted plain text.
 */
const extractTextFromImage = async (filePath) => {
  try {
    const result = await Tesseract.recognize(
      filePath,
      'eng',
      { 
        logger: m => console.log(`OCR Progress: ${(m.progress * 100).toFixed(1)}% - ${m.status}`) 
      }
    );
    return result.data.text;
  } catch (err) {
    console.error('OCR Extraction failed:', err);
    throw new Error('Failed to extract text from medical report.');
  }
};

/**
 * Parses key blood report parameters using regex patterns.
 * @param {string} text - Plain text extracted via OCR.
 * @returns {object} - Object containing parsed values or nulls.
 */
const parseMedicalVitals = (text) => {
  const result = {
    hemoglobin: null,
    wbc: null,
    glucose: null,
    cholesterol: null
  };

  const lines = text.split('\n');

  for (const line of lines) {
    // Hemoglobin parsing (Range: 12.0 - 17.5 g/dL)
    // Matches patterns like "Hemoglobin: 14.5 g/dL" or "Hb - 13.8"
    if (/hemoglobin|hb/i.test(line)) {
      const match = line.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        result.hemoglobin = parseFloat(match[1]);
      }
    }

    // WBC parsing (Range: 4,500 - 11,000 /mcL or 4.5 - 11.0)
    // Matches patterns like "WBC: 6500" or "White Blood Cells - 7,200"
    if (/wbc|white\s*blood|leukocytes/i.test(line)) {
      const cleanLine = line.replace(/,/g, '');
      const match = cleanLine.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        let val = parseFloat(match[1]);
        // If expressed in thousands (e.g. 6.5 instead of 6500)
        if (val < 50 && val > 0) val = val * 1000;
        result.wbc = val;
      }
    }

    // Glucose fasting/random parsing (Range: 70 - 140 mg/dL)
    // Matches patterns like "Glucose: 98 mg/dL" or "Blood Sugar 104"
    if (/glucose|sugar|fasting\s*sugar/i.test(line)) {
      const match = line.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        result.glucose = parseFloat(match[1]);
      }
    }

    // Cholesterol parsing (Range: < 200 mg/dL)
    // Matches patterns like "Cholesterol: 185 mg/dL" or "Total Cholesterol - 210"
    if (/cholesterol|ldl|lipid/i.test(line)) {
      const match = line.match(/(\d+(?:\.\d+)?)/);
      if (match) {
        result.cholesterol = parseFloat(match[1]);
      }
    }
  }

  return result;
};

/**
 * Performs OCR and sweeps the uploaded image file afterwards.
 */
const processReportOCR = async (filePath) => {
  try {
    const text = await extractTextFromImage(filePath);
    const parsedVitals = parseMedicalVitals(text);

    // Asynchronously delete the file to save disk space
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete temp file:', filePath, err);
      else console.log('Successfully cleaned up temp file:', filePath);
    });

    return { text, parsedVitals };
  } catch (error) {
    // Make sure we delete the file even if OCR fails
    fs.unlink(filePath, () => {});
    throw error;
  }
};

module.exports = {
  processReportOCR,
  parseMedicalVitals
};
