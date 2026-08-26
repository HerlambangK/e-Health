import { Schema, model } from 'mongoose';
import type { Document } from 'mongoose';

export interface INotification extends Document {
	recipientId?: Schema.Types.ObjectId;
	recipientRole?: string;
	type:
		| 'queue_call'
		| 'prescription_ready'
		| 'encounter_update'
		| 'admission'
		| 'discharge'
		| 'billing_update'
		| 'login'
		| 'login_success'
		| 'login_failed'
		| 'email_blast_progress'
		| 'email_blast_complete'
		| 'system';
	title: string;
	message: string;
	data?: Record<string, any>;
	channel: 'personal' | 'role' | 'poli' | 'broadcast';
	isRead: boolean;
	readAt?: Date;
	createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
	{
		recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
		recipientRole: String,
		type: {
			type: String,
			enum: [
				'queue_call',
				'prescription_ready',
				'encounter_update',
				'admission',
				'discharge',
				'billing_update',
				'login',
				'login_success',
				'login_failed',
				'email_blast_progress',
				'email_blast_complete',
				'system',
			],
			required: true,
		},
		title: { type: String, required: true },
		message: { type: String, required: true },
		data: Schema.Types.Mixed,
		channel: {
			type: String,
			enum: ['personal', 'role', 'poli', 'broadcast'],
			default: 'personal',
		},
		isRead: { type: Boolean, default: false },
		readAt: Date,
	},
	{ timestamps: true },
);

NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientRole: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index(
	{ createdAt: 1 },
	{ expireAfterSeconds: 30 * 24 * 3600 },
); // TTL: 30 days

export default model<INotification>('Notification', NotificationSchema);
