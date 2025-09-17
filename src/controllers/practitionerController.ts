import { Response } from "express";
import { UserModel } from "../models/User";
import { AuthenticatedRequest } from "../middleware/auth";

export async function getPractitioners(req: AuthenticatedRequest, res: Response) {
  try {
    const practitioners = await UserModel.find({ role: "practitioner" })
      .select("firstName lastName email concern specializations timeSlots")
      .sort({ firstName: 1 });

    return res.json(practitioners);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch practitioners" });
  }
}

export async function getPractitionerById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const practitioner = await UserModel.findOne({ 
      _id: id, 
      role: "practitioner" 
    }).select("firstName lastName email concern specializations timeSlots");

    if (!practitioner) {
      return res.status(404).json({ message: "Practitioner not found" });
    }

    return res.json(practitioner);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch practitioner" });
  }
}

export async function getPractitionerTimeSlots(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const practitioner = await UserModel.findOne({ 
      _id: id, 
      role: "practitioner" 
    }).select("timeSlots");

    if (!practitioner) {
      return res.status(404).json({ message: "Practitioner not found" });
    }

    // Filter available time slots
    const availableSlots = practitioner.timeSlots?.filter(slot => slot.available) || [];

    return res.json({
      practitionerId: id,
      date: date || new Date().toISOString().split('T')[0],
      timeSlots: availableSlots
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch time slots" });
  }
}
