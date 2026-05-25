import mongoose from 'mongoose';

function buildMongoUrlFromParts(): string | null {
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT || '27017';
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const dbName = process.env.DB_NAME;

  if (!host || !user || !password || !dbName) return null;

  return `mongodb://${encodeURIComponent(user)}:${encodeURIComponent(
    password
  )}@${host}:${port}/${dbName}?authSource=admin`;
}

export async function connectDb(): Promise<void> {
  const mongoUrl =
    process.env.DATABASE_URL || buildMongoUrlFromParts() || process.env.MONGO_URL;

  if (!mongoUrl) {
    throw new Error(
      'Missing MongoDB connection string. Set DATABASE_URL (recommended).'
    );
  }

  await mongoose.connect(mongoUrl);
  console.log('[MongoDB] Connected');
}
