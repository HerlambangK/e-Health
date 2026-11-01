import { Schema, model, type Document } from 'mongoose';

export interface IIotSensorTelemetry extends Document {
	deviceId: string;
	deviceName?: string;
	timestamp: Date;
	data: Record<string, number>;
	status: 'normal' | 'warning' | 'danger';
	alertMessage?: string;
	connectedSsid?: string;
	rssi?: number;
	createdAt: Date;
	updatedAt: Date;
}

const iotSensorTelemetrySchema = new Schema<IIotSensorTelemetry>(
	{
		deviceId: {
			type: String,
			required: [true, 'Device ID wajib ada'],
			trim: true,
			index: true,
		},
		deviceName: {
			type: String,
			trim: true,
		},
		timestamp: {
			type: Date,
			default: Date.now,
			index: true,
		},
		data: {
			type: Schema.Types.Mixed,
			required: true,
			default: {},
		},
		status: {
			type: String,
			enum: ['normal', 'warning', 'danger'],
			default: 'normal',
			index: true,
		},
		alertMessage: {
			type: String,
			trim: true,
		},
		connectedSsid: {
			type: String,
			trim: true,
		},
		rssi: {
			type: Number,
		},
	},
	{
		timestamps: true,
	},
);

// Compound index for fast time-series queries
iotSensorTelemetrySchema.index({ deviceId: 1, timestamp: -1 });

export default model<IIotSensorTelemetry>(
	'IotSensorTelemetry',
	iotSensorTelemetrySchema,
);

