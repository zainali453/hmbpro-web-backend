import mongoose, { Document, Schema } from "mongoose";


export type UserRole = "patient" | "practitioner";

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface UserDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  dateOfBirth: Date;
  placeOfBirth?: string;
  phone: string;
  concern: string;
  profilePicture?: string;
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;
  role: UserRole;
  specializations?: string[];
  timeSlots?: TimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}


const userSchema = new Schema<UserDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String },
    phone: { type: String, required: true },
    concern: { type: String, required: true },
    profilePicture: { type: String },
    agreeToTerms: { type: Boolean, required: true },
    agreeToPrivacy: { type: Boolean, required: true },
    role: { type: String, enum: ["patient", "practitioner"], default: "patient", index: true },
    specializations: [{ type: String }],
    timeSlots: [{
      time: { type: String, required: true },
      available: { type: Boolean, required: true }
    }],
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>("User", userSchema);


