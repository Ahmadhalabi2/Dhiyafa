const mongoose = require('mongoose');

let connected = false;

async function connectDB() {
  if (connected) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    connected = true;
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { connectDB };
