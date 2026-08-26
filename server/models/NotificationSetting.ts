import { Schema, model } from 'mongoose';
import type { Document, Types } from 'mongoose';

export interface INotificationSetting extends Document {
  email: string;
  name: string;
  isActive: boolean;
  notificationTypes: string[];
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSettingSchema = new Schema<INotificationSetting>({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  notificationTypes: { type: [String], default: ['Semua'] },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

NotificationSettingSchema.index({ email: 1 });
NotificationSettingSchema.index({ isActive: 1 });

export default model<INotificationSetting>('NotificationSetting', NotificationSettingSchema);
