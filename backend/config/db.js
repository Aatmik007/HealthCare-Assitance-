const mongoose = require('mongoose');

let isMongoConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.warn("\n⚠️ WARNING: MONGODB_URI is not defined in the environment variables.");
      console.warn("⚠️ Falling back to local JSON database storage (db_fallback/).\n");
      isMongoConnected = false;
      return false;
    }

    // Set connection timeout to 3 seconds for quick local failover checks
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    
    isMongoConnected = true;
    console.log("\n🚀 Success: Connected to MongoDB database!\n");
    return true;
  } catch (err) {
    console.error(`\n❌ Error: Failed to connect to MongoDB: ${err.message}`);
    console.warn("⚠️ Falling back to local JSON database storage (db_fallback/).\n");
    isMongoConnected = false;
    return false;
  }
};

const getDbMode = () => {
  return isMongoConnected ? 'mongodb' : 'fallback';
};

module.exports = { connectDB, getDbMode };
