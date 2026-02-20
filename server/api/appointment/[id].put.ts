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
    const id = event.context.params?.id as string;
    const body = await readBody(event);
    Validator.validateSchema(AppointmentSchema.partial(), body);

    const payload: Record<string, any> = { ...body };

    if (payload.startAt) {
      const startAt = toDate(payload.startAt);
      if (!startAt) {
        return sendError(event, 400, "validation_error", "Invalid start time");
      }
      payload.startAt = startAt;
    }

    if (payload.endAt) {
      const endAt = toDate(payload.endAt);
      if (!endAt) {
        return sendError(event, 400, "validation_error", "Invalid end time");
      }
      payload.endAt = endAt;
    }

    const existing = await Appointment.findById(id);
    if (!existing) {
      return sendError(event, 404, "not_found", "Appointment not found");
    }

    const startAt = payload.startAt ?? existing.startAt;
    const endAt = payload.endAt ?? existing.endAt;

    if (startAt >= endAt) {
      return sendError(event, 400, "validation_error", "Invalid appointment time range");
    }

    const overlap = await Appointment.findOne({
      _id: { $ne: id },
      doctorId: payload.doctorId ?? existing.doctorId,
      status: { $ne: "cancelled" },
      startAt: { $lt: endAt },
      endAt: { $gt: startAt },
    });

    if (overlap) {
      return sendError(event, 409, "conflict", "Appointment time overlaps with existing schedule");
    }

    const updated = await Appointment.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    return sendSuccess(event, updated!);
  } catch (error: any) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid data format", error);
  }
});
