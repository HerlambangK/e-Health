import { Schema, model } from "mongoose";
import type { Document } from "mongoose";
interface IDokter extends Document {
  namaDokter: string;
  nip: string;
  spesialisasi: string;
  poli: string;
}

const dokterSchema = new Schema({
  namaDokter: { type: String, required: true },
  nip: { type: String, required: true },
  spesialisasi: { type: String, required: true },
  poli: { type: String, required: true },
});

export default model<IDokter>("Dokter", dokterSchema);
// export const Dokter = model<IDokter>("Dokter", dokterSchema);
