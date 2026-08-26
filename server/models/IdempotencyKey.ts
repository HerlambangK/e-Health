import { Schema, model } from 'mongoose';

interface IIdempotencyKey {
  key: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseBody: any;
  createdAt: Date;
}

const IdempotencyKeySchema = new Schema<IIdempotencyKey>({
  key: { type: String, required: true },
  userId: { type: String, required: true },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  statusCode: { type: Number, required: true },
  responseBody: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

// Unique compound index
IdempotencyKeySchema.index({ key: 1, userId: 1 }, { unique: true });
// TTL index: auto-delete after 24 hours
IdempotencyKeySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default model<IIdempotencyKey>('IdempotencyKey', IdempotencyKeySchema);
