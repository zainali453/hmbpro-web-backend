import mongoose, { Document, Schema, Types } from "mongoose";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type AppointmentType = "initial" | "followup";

export interface PatientInfo {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  email: string;
  phone: string;
  concern: string;
  medicalHistory?: string;
}

export interface AppointmentDocument extends Document {
  patient: Types.ObjectId;
  practitioner: Types.ObjectId;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // HH:mm
  appointmentType: AppointmentType;
  patientInfo: PatientInfo;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientInfoSchema = new Schema<PatientInfo>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: String, required: true },
    placeOfBirth: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    concern: { type: String, required: true },
    medicalHistory: { type: String },
  },
  { _id: false }
);

const appointmentSchema = new Schema<AppointmentDocument>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    practitioner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    appointmentType: { type: String, enum: ["initial", "followup"], required: true },
    patientInfo: { type: patientInfoSchema, required: true },
    status: { type: String, enum: ["pending", "confirmed", "completed", "cancelled"], default: "pending", index: true },
    notes: { type: String },
  },
  { timestamps: true }
);

appointmentSchema.index({ practitioner: 1, date: 1, time: 1 }, { unique: true });

export const AppointmentModel = mongoose.model<AppointmentDocument>(
  "Appointment",
  appointmentSchema
);


