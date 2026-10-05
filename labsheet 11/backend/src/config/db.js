import mongoose from 'mongoose';

export const connectDB = async (uri = process.env.MONGO_URI) => {
  try {
    const conn = await mongoose.connect(uri || 'mongodb://localhost:27017/campusconnect_db');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('[Database] MongoDB Connection Closed');
  } catch (error) {
    console.error(`[Database Error] Disconnect failed: ${error.message}`);
  }
};
