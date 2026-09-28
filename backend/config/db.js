import mongoose from 'mongoose';

/**
 * Connects to MongoDB database using Mongoose
 * Reads connection string securely from process.env.MONGO_URI
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error: ${error.message}`);
    console.warn('[MongoDB] Running with reduced persistence capability until MongoDB is available.');
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Connection lost. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('[MongoDB] Successfully reconnected.');
});

export default connectDB;