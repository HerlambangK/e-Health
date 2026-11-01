import { Schema, model, type Document } from 'mongoose';

export interface ISensorParam {
	key: string;
	name: string;
	unit: string;
	minThreshold?: number;
	maxThreshold?: number;
}

export interface ILatestTelemetry {
	values: Record<string, number>;
	status: 'normal' | 'warning' | 'danger';
	alertMessage?: string;
	updatedAt: Date;
}

export interface IIotDevice extends Document {
	deviceId: string;
	name: string;
	type: 'presensi' | 'sensor';
	location?: string;
	status: 'online' | 'offline';
	lastSeen: Date;
	connectedSsid?: string;
	ipAddress?: string;
	rssi?: number;
	firmwareVersion?: string;
	sensorConfig?: ISensorParam[];
	latestTelemetry?: ILatestTelemetry;
	registeredAt: Date;
	isActive: boolean;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

const iotDeviceSchema = new Schema<IIotDevice>(
	{
		deviceId: {
			type: String,
			required: [true, 'Device ID wajib diisi'],
			unique: true,
			trim: true,
			index: true,
		},
		name: {
			type: String,
			default: 'Mesin IoT',
			trim: true,
		},
		type: {
			type: String,
			enum: ['presensi', 'sensor'],
			default: 'presensi',
			index: true,
		},
		location: {
			type: String,
			default: 'Pintu Masuk Utama',
			trim: true,
		},
		status: {
			type: String,
			enum: ['online', 'offline'],
			default: 'offline',
			index: true,
		},
		lastSeen: {
			type: Date,
			default: Date.now,
			index: true,
		},
		connectedSsid: {
			type: String,
			trim: true,
		},
		ipAddress: {
			type: String,
			trim: true,
		},
		rssi: {
			type: Number,
		},
		firmwareVersion: {
			type: String,
			default: 'v1.0.0',
			trim: true,
		},
		sensorConfig: [
			{
				key: { type: String, required: true },
				name: { type: String, required: true },
				unit: { type: String, default: '' },
				minThreshold: { type: Number },
				maxThreshold: { type: Number },
			},
		],
		latestTelemetry: {
			values: { type: Schema.Types.Mixed, default: {} },
			status: {
				type: String,
				enum: ['normal', 'warning', 'danger'],
				default: 'normal',
			},
			alertMessage: { type: String, default: '' },
			updatedAt: { type: Date, default: Date.now },
		},
		registeredAt: {
			type: Date,
			default: Date.now,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		notes: {
			type: String,
			trim: true,
		},
	},
	{
		timestamps: true,
	},
);

export default model<IIotDevice>('IotDevice', iotDeviceSchema);

