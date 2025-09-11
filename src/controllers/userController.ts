import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { AuthenticatedRequest } from "../middleware/auth";
import { UserModel } from "../models/User";
import { AppointmentModel } from "../models/Appointment";

export async function updateMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "patient") return res.status(403).json({ message: "Forbidden" });

    const { name, password } = req.body as { name?: string; password?: string };

    const updates: Record<string, unknown> = {};
    if (name) updates.name = name;
    if (password) updates.passwordHash = await bcrypt.hash(password, 10);

    const user = await UserModel.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true, projection: { name: 1, email: 1, role: 1 } }
    );

    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
}

export async function deleteMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role !== "patient") return res.status(403).json({ message: "Forbidden" });

    // delete patient's appointments first
    await AppointmentModel.deleteMany({ patient: req.user.userId });
    await UserModel.findByIdAndDelete(req.user.userId);

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete account" });
  }
}
