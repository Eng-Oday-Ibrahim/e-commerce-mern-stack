import mongoose from 'mongoose';

export async function connectDb(): Promise<void> {
  const mongoUrl = process.env.DATABASE_URL;

  if (!mongoUrl) {
    throw new Error(
      'Missing MongoDB connection string. Set DATABASE_URL (recommended).'
    );
  }

  await mongoose.connect(mongoUrl);
  console.log('[MongoDB] Connected');
}
