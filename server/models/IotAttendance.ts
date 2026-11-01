import { Schema, model, type Document } from 'mongoose';

export interface IIotAttendance extends Document {
	deviceId: string;
	deviceName?: string;
	uid: string;
	user?: Schema.Types.ObjectId;
	userName: string;
	userNip?: string;
	userRole?: string;
	type: 'masuk' | 'pulang';
	timestamp: Date;
	status: 'tepat_waktu' | 'terlambat' | 'pulang_cepat' | 'lembur';
	connectedSsid?: string;
	notes?: string;
	createdAt: Date;
	updatedAt: Date;
}

const iotAttendanceSchema = new Schema<IIotAttendance>(
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
		uid: {
			type: String,
			required: [true, 'UID kartu/RFID/NIP wajib ada'],
			trim: true,
			index: true,
		},
		user: {
			type: Schema.Types.ObjectId,
			ref: 'User',
		},
		userName: {
			type: String,
			required: true,
			trim: true,
		},
		userNip: {
			type: String,
			trim: true,
		},
		userRole: {
			type: String,
			default: 'pegawai',
			trim: true,
		},
		type: {
			type: String,
			enum: ['masuk', 'pulang'],
			required: true,
			index: true,
		},
		timestamp: {
			type: Date,
			default: Date.now,
			index: true,
		},
		status: {
			type: String,
			enum: ['tepat_waktu', 'terlambat', 'pulang_cepat', 'lembur'],
			default: 'tepat_waktu',
			index: true,
		},
		connectedSsid: {
			type: String,
			trim: true,
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

export default model<IIotAttendance>('IotAttendance', iotAttendanceSchema);

