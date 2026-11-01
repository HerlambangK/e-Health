import { Schema, model, type Document } from 'mongoose';

export interface IIotWifi extends Document {
	ssid: string;
	password: string;
	priority: number;
	isActive: boolean;
	description?: string;
	timeoutMs?: number;
	createdAt: Date;
	updatedAt: Date;
}

const iotWifiSchema = new Schema<IIotWifi>(
	{
		ssid: {
			type: String,
			required: [true, 'SSID wajib diisi'],
			trim: true,
		},
		password: {
			type: String,
			required: [true, 'Password wajib diisi'],
			trim: true,
		},
		priority: {
			type: Number,
			default: 1,
		},
		isActive: {
			type: Boolean,
			default: true,
			index: true,
		},
		description: {
			type: String,
			trim: true,
		},
		timeoutMs: {
			type: Number,
			default: 12000,
		},
	},
	{
		timestamps: true,
	},
);

export default model<IIotWifi>('IotWifi', iotWifiSchema);

