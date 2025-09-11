import { Response } from "express";
import { AppointmentModel } from "../models/Appointment";
import { AuthenticatedRequest } from "../middleware/auth";

export async function createAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { practitioner, date, time, type, notes } = req.body as {
      practitioner: string;
      date: string;
      time: string;
      type: string;
      notes?: string;
    };
    if (!practitioner || !date || !time || !type)
      return res.status(400).json({ message: "Missing required fields" });

    const appointment = await AppointmentModel.create({
      patient: req.user.userId,
      practitioner,
      date,
      time,
      type,
      notes,
    });
    return res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create appointment" });
  }
}

export async function getMyAppointments(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const filter: any = {};
    if (req.user.role === "patient") filter.patient = req.user.userId;
    if (req.user.role === "practitioner") filter.practitioner = req.user.userId;
    const appts = await AppointmentModel.find(filter)
      .populate("patient", "name email")
      .populate("practitioner", "name email")
      .sort({ date: 1, time: 1 });
    return res.json(appts);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch appointments" });
  }
}


