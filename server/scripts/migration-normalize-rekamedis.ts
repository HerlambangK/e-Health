import mongoose from 'mongoose';
import RekamMedis from '../models/RekamMedis';

async function migrate() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set');
  
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  // Normalize pasienId
  const pasienResult = await RekamMedis.updateMany(
    { pasienId: { $exists: false }, namaPasien: { $exists: true, $ne: null } },
    [{ $set: { pasienId: '$namaPasien' } }]
  );
  console.log(`Normalized pasienId: ${pasienResult.modifiedCount} records`);

  // Normalize dokterId
  const dokterResult = await RekamMedis.updateMany(
    { dokterId: { $exists: false }, dokter: { $exists: true, $ne: null } },
    [{ $set: { dokterId: '$dokter' } }]
  );
  console.log(`Normalized dokterId: ${dokterResult.modifiedCount} records`);

  await mongoose.disconnect();
  console.log('Migration complete');
}

migrate().catch(console.error);
