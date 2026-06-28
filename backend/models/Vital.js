const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');
const FallbackDB = require('../db_fallback');

const VitalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  heartRate: { type: Number, required: true },
  systolic: { type: Number, required: true },
  diastolic: { type: Number, required: true },
  temperature: { type: Number, required: true },
  spo2: { type: Number, required: true },
  respiratoryRate: { type: Number },
  bloodSugar: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

const MongoVital = mongoose.model('Vital', VitalSchema);

const VitalWrapper = {
  find: async (query, sort = { createdAt: -1 }) => {
    if (getDbMode() === 'mongodb') {
      return await MongoVital.find(query).sort(sort);
    }
    // Implement standard sort for fallback array
    const results = FallbackDB.find('vitals', query);
    return results.sort((a, b) => {
      const order = sort.createdAt === 1 ? 1 : -1;
      return (new Date(a.createdAt) - new Date(b.createdAt)) * order;
    });
  },

  create: async (data) => {
    if (getDbMode() === 'mongodb') {
      return await MongoVital.create(data);
    }
    return FallbackDB.insert('vitals', data);
  },

  deleteMany: async (query) => {
    if (getDbMode() === 'mongodb') {
      return await MongoVital.deleteMany(query);
    }
    return FallbackDB.delete('vitals', query);
  }
};

module.exports = VitalWrapper;
