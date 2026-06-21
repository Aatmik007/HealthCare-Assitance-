const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');
const FallbackDB = require('../db_fallback');

const MedicalReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  extractedText: { type: String, default: '' },
  parsedVitals: {
    hemoglobin: { type: Number, default: null },
    wbc: { type: Number, default: null },
    glucose: { type: Number, default: null },
    cholesterol: { type: Number, default: null }
  },
  createdAt: { type: Date, default: Date.now }
});

const MongoMedicalReport = mongoose.model('MedicalReport', MedicalReportSchema);

const MedicalReportWrapper = {
  find: async (query, sort = { createdAt: -1 }) => {
    if (getDbMode() === 'mongodb') {
      return await MongoMedicalReport.find(query).sort(sort);
    }
    const results = FallbackDB.find('reports', query);
    return results.sort((a, b) => {
      const order = sort.createdAt === 1 ? 1 : -1;
      return (new Date(a.createdAt) - new Date(b.createdAt)) * order;
    });
  },

  create: async (data) => {
    if (getDbMode() === 'mongodb') {
      return await MongoMedicalReport.create(data);
    }
    return FallbackDB.insert('reports', data);
  },

  deleteMany: async (query) => {
    if (getDbMode() === 'mongodb') {
      return await MongoMedicalReport.deleteMany(query);
    }
    return FallbackDB.delete('reports', query);
  }
};

module.exports = MedicalReportWrapper;
