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
    connectionPromise = mongoose.connect(mongodbUri);
  }

  await connectionPromise;
});
