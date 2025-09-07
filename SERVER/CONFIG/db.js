  const mongoose = require('mongoose');
  const config = require('./config');

  const connectDB = async () => {
    try {
      const connect = await mongoose.connect(config.db.uri).then(() => {
        console.log('MongoDB connected successfully');
      });
      return connect;
    } catch (error) {
      console.error(`MongoDB Connection Error: ${error.message}`);
      // Don't exit the process, return null instead
      // This allows the server to still run and serve static content
      return null;
    }
  };

  module.exports = connectDB;
