import { Validator } from "#nuxt-server-utils";
import BillingSchema from "~/schemas/Billing.schema";
import Billing from "~/server/models/Billing";
import { sendApiError, sendSuccess } from "~/server/utils/response";
import { generateId } from "~/server/utils/generate-id";
import { notify } from "~/server/utils/notify";

function calculateTotal(items: Array<{ quantity: number; price: number }>) {
  return items.reduce((total, item) => total + item.quantity * item.price, 0);
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    Validator.validateSchema(BillingSchema, body);

    const total = calculateTotal(body.items || []);
    const invoiceNumber =
      body.invoiceNumber || generateId('INV');

    const created = await Billing.create({
      ...body,
      invoiceNumber,
      total,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      paidAt: body.paidAt ? new Date(body.paidAt) : undefined,
    });

    await notify({
      recipientId: body.pasienId,
      type: 'billing_update',
      title: 'Invoice Baru',
      message: `Invoice ${invoiceNumber} telah dibuat. Total: Rp ${total.toLocaleString('id-ID')}`,
      data: { billingId: created._id, invoiceNumber, total },
    });

    return sendSuccess(event, created, 201);
  } catch (error: any) {
    console.error(error);
    return sendApiError(event, 400, "validation_error", "Invalid data format", error);
  }
});
