const mongoose = require('mongoose');
const { getDbMode } = require('../config/db');
const FallbackDB = require('../db_fallback');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  age: { type: Number, default: 30 },
  gender: { type: String, default: 'Unspecified' },
  bloodType: { type: String, default: 'Unknown' },
  chronicConditions: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const MongoUser = mongoose.model('User', UserSchema);

const UserWrapper = {
  findOne: async (query) => {
    if (getDbMode() === 'mongodb') {
      return await MongoUser.findOne(query);
    }
    return FallbackDB.findOne('users', query);
  },

  findById: async (id) => {
    if (getDbMode() === 'mongodb') {
      return await MongoUser.findById(id);
    }
    return FallbackDB.findById('users', id);
  },

  create: async (data) => {
    if (getDbMode() === 'mongodb') {
      return await MongoUser.create(data);
    }
    return FallbackDB.insert('users', data);
  },

  updateOne: async (query, update) => {
    if (getDbMode() === 'mongodb') {
      return await MongoUser.updateOne(query, update);
    }
    const cleanUpdate = update.$set ? update.$set : update;
    return FallbackDB.update('users', query, cleanUpdate);
  }
};

module.exports = UserWrapper;
