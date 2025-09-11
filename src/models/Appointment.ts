import mongoose, { Document, Schema, Types } from "mongoose";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface AppointmentDocument extends Document {
  patient: Types.ObjectId;
  practitioner: Types.ObjectId;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // HH:mm
  type: string; // consultation, therapy, etc.
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<AppointmentDocument>(
  {
    patient: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    practitioner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: { type: String, required: true },
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


