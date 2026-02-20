import { Validator } from "#nuxt-server-utils";
import BillingSchema from "~/schemas/Billing.schema";
import Billing from "~/server/models/Billing";
import { sendError, sendSuccess } from "~/server/utils/response";

function calculateTotal(items: Array<{ quantity: number; price: number }>) {
  return items.reduce((total, item) => total + item.quantity * item.price, 0);
}

export default defineEventHandler(async (event) => {
  try {
    const id = event.context.params?.id as string;
    const body = await readBody(event);
    Validator.validateSchema(BillingSchema.partial(), body);

    const payload: Record<string, any> = { ...body };

    if (payload.items) {
      payload.total = calculateTotal(payload.items);
    }

    if (payload.dueDate) {
      payload.dueDate = new Date(payload.dueDate);
    }

    if (payload.paidAt) {
      payload.paidAt = new Date(payload.paidAt);
    }

    const updated = await Billing.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return sendError(event, 404, "not_found", "Billing not found");
    }

    return sendSuccess(event, updated);
  } catch (error: any) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid data format", error);
  }
});
