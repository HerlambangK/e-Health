import { z } from "h3-zod";

const AppointmentSchema = z.object({
  patientId: z.string().min(1),
  doctorId: z.string().min(1),
  startAt: z.string().min(1),
  endAt: z.string().min(1),
  status: z
    .enum(["scheduled", "checked-in", "completed", "cancelled", "no-show"])
    .optional(),
  notes: z.string().optional(),
});

export default AppointmentSchema;
