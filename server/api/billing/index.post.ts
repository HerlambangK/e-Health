import { Validator } from "#nuxt-server-utils";
import BillingSchema from "~/schemas/Billing.schema";
import Billing from "~/server/models/Billing";
import { sendError, sendSuccess } from "~/server/utils/response";

function calculateTotal(items: Array<{ quantity: number; price: number }>) {
  return items.reduce((total, item) => total + item.quantity * item.price, 0);
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    Validator.validateSchema(BillingSchema, body);

    const total = calculateTotal(body.items || []);
    const invoiceNumber =
      body.invoiceNumber || `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const created = await Billing.create({
      ...body,
      invoiceNumber,
      total,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      paidAt: body.paidAt ? new Date(body.paidAt) : undefined,
    });

    return sendSuccess(event, created, 201);
  } catch (error: any) {
    console.error(error);
    return sendError(event, 400, "validation_error", "Invalid data format", error);
  }
});
