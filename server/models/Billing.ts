import { Schema, model, Document } from "mongoose";

export interface IBillingItem {
  description: string;
  quantity: number;
  price: number;
}

export interface IBilling extends Document {
  patientId: string;
  invoiceNumber: string;
  items: IBillingItem[];
  total: number;
  status: "draft" | "issued" | "paid" | "void";
  dueDate?: Date;
  paidAt?: Date;
}

const billingItemSchema = new Schema<IBillingItem>(
  {
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const billingSchema = new Schema<IBilling>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Pasien", required: true },
    invoiceNumber: { type: String, required: true, unique: true },
    items: { type: [billingItemSchema], default: [] },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ["draft", "issued", "paid", "void"],
      default: "draft",
    },
    dueDate: { type: Date },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

export default model<IBilling>("Billing", billingSchema);
