import { z } from "h3-zod";

const BillingItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().min(1),
  price: z.coerce.number().min(0),
});

const BillingSchema = z.object({
  patientId: z.string().min(1),
  invoiceNumber: z.string().optional(),
  items: z.array(BillingItemSchema).min(1),
  total: z.coerce.number().min(0),
  status: z.enum(["draft", "issued", "paid", "void"]).optional(),
  dueDate: z.string().optional(),
  paidAt: z.string().optional(),
});

export default BillingSchema;
