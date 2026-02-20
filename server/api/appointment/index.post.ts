import { Validator } from "#nuxt-server-utils";
import AppointmentSchema from "~/schemas/Appointment.schema";
import Appointment from "~/server/models/Appointment";
import { sendError, sendSuccess } from "~/server/utils/response";

function toDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    Validator.validateSchema(AppointmentSchema, body);

    const startAt = toDate(body.startAt);
    const endAt = toDate(body.endAt);

    if (!startAt || !endAt || startAt >= endAt) {
      return sendError(event, 400, "validation_error", "Invalid appointment time range");
    }

    const overlap = await Appointment.findOne({
      doctorId: body.doctorId,
      status: { $ne: "cancelled" },
      startAt: { $lt: endAt },
      endAt: { $gt: startAt },
    });

    if (overlap) {
      return sendError(event, 409, "conflict", "Appointment time overlaps with existing schedule");
    }

    const created = await Appointment.create({
      ...body,
      startAt,
      endAt,
    });

    return sendSuccess(event, created, 201);
  } catch (error: any) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid data format", error);
  }
});
