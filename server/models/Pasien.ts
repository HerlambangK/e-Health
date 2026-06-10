import { Schema, model, Document } from "mongoose";

export interface IPasien extends Document {
  nik: string;
  noRM: string;
  nama: string;
  tgl_lahir?: Date;
  umur: number;
  jenis_kelamin?: "L" | "P";
  gol_darah?: "A" | "B" | "AB" | "O";
  alamat?: {
    jalan: string;
    kelurahan?: string;
    kecamatan?: string;
    kota: string;
    provinsi: string;
    kodePos?: string;
  };
  address: string;
  telepon: string;
  notlp: string;
  email?: string;
  fotoProfil?: string;
  asuransi?: {
    jenis: "BPJS" | "umum" | "asuransi" | "gratis";
    nomor?: string;
  };
  jenisAsuransi: string;
  alergi?: string[];
  allergies?: string[];
  kontak_darurat?: {
    nama: string;
    hubungan: string;
    telepon: string;
  };
  emergencyContact?: string;
  dokter: string;
  poli: string;
  rekamedis: string;
  userId?: string;
  riwayatPenyakit?: string[];
  completedStatus: boolean;
  billingPlan?: string;
  appointmentDate?: string;
  appointmentTime?: string;
  appointmentNotes?: string;
  fhirId?: string;
  fhirSyncStatus: "pending" | "sent" | "success" | "failed" | "not_required";
  fhirSyncAt?: Date;
  fhirSyncError?: string;
  fhirSyncRetry: number;
}

const pasienSchema = new Schema<IPasien>(
  {
    nik: { type: String, unique: true, sparse: true },
    noRM: { type: String, unique: true },
    nama: { type: String, required: true },
    umur: { type: Number, required: true },
    tgl_lahir: Date,
    jenis_kelamin: { type: String, enum: ["L", "P"] },
    gol_darah: { type: String, enum: ["A", "B", "AB", "O"] },
    alamat: {
      jalan: String,
      kelurahan: String,
      kecamatan: String,
      kota: String,
      provinsi: String,
      kodePos: String,
    },
    address: { type: String, required: true },
    notlp: { type: String, required: true },
    telepon: String,
    email: String,
    fotoProfil: {
      type: String,
      default: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60",
    },
    asuransi: {
      jenis: { type: String, enum: ["BPJS", "umum", "asuransi", "gratis"], default: "umum" },
      nomor: String,
    },
    jenisAsuransi: { type: String, required: true },
    alergi: [{ type: String }],
    allergies: [{ type: String }],
    kontak_darurat: {
      nama: String,
      hubungan: String,
      telepon: String,
    },
    emergencyContact: String,
    dokter: { type: Schema.Types.ObjectId, ref: "Dokter" },
    poli: { type: String },
    rekamedis: { type: Schema.Types.ObjectId, ref: "Rekamedis" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    riwayatPenyakit: [{ type: String }],
    completedStatus: { type: Boolean, default: false },
    billingPlan: String,
    appointmentDate: String,
    appointmentTime: String,
    appointmentNotes: String,
    fhirId: String,
    fhirSyncStatus: {
      type: String,
      enum: ["pending", "sent", "success", "failed", "not_required"],
      default: "pending",
    },
    fhirSyncAt: Date,
    fhirSyncError: String,
    fhirSyncRetry: { type: Number, default: 0 },
  },
  { timestamps: true }
);

pasienSchema.index({ nik: 1 });
pasienSchema.index({ noRM: 1 });

export default model<IPasien>("Pasien", pasienSchema);
