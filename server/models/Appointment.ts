import { Schema, model, Document } from "mongoose";

export interface IAppointment extends Document {
  patientId: string;
  doctorId: string;
  startAt: Date;
  endAt: Date;
  status: "scheduled" | "checked-in" | "completed" | "cancelled" | "no-show";
  notes?: string;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Pasien", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Dokter", required: true },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "checked-in", "completed", "cancelled", "no-show"],
      default: "scheduled",
    },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

export default model<IAppointment>("Appointment", appointmentSchema);
