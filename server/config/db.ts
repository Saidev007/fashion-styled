import mongoose from 'mongoose';
import { env } from './env.js';

let connection: Promise<typeof mongoose> | undefined;
export async function connectDatabase() {
  if (!env.MONGODB_URI) {
    if (env.NODE_ENV === 'production') throw new Error('MONGODB_URI is required in production.');
    console.warn('MONGODB_URI is not configured. Database routes will be unavailable.');
    return false;
  }
  try {
    connection ??= mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
    await connection;
    return true;
  } catch (error) { connection = undefined; throw error; }
}
