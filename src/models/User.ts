import mongoose, { Document, Schema } from "mongoose";

export type UserRole = "patient" | "practitioner";

export interface UserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["patient", "practitioner"], default: "patient", index: true },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<UserDocument>("User", userSchema);


