import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

export default defineNitroPlugin(async () => {
  const { mongodbUri } = useRuntimeConfig();

  if (!mongodbUri) {
    throw new Error(
      "[mongo] MONGODB_URI belum di-set. Tambahkan di .env agar autentikasi & API berjalan."
    );
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    mongoose.set("strictQuery", true);
    mongoose.set("bufferTimeoutMS", 30000);
    connectionPromise = mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 120000,
      maxPoolSize: 5,
    });
  }

  await connectionPromise;
});
