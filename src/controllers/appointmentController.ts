import { Response } from "express";
import { AppointmentModel } from "../models/Appointment";
import { AuthenticatedRequest } from "../middleware/auth";

export async function createAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    
    // Accept patient fields at root level (not nested)
    const {
      practitioner,
      date,
      time,
      appointmentType,
      firstName,
      lastName,
      dateOfBirth,
      placeOfBirth,
      email,
      phone,
      concern,
      medicalHistory,
      notes
    } = req.body;

    // Validate required fields
    if (!practitioner || !date || !time || !appointmentType || !firstName || !lastName || !dateOfBirth || !email || !phone || !concern) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Construct patientInfo object for the model
    const patientInfo = {
      firstName,
      lastName,
      dateOfBirth,
      placeOfBirth,
      email,
      phone,
      concern,
      medicalHistory
    };

    const appointment = await AppointmentModel.create({
      patient: req.user.userId,
      practitioner,
      date,
      time,
      appointmentType,
      patientInfo,
      notes,
    });
    return res.status(201).json(appointment);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create appointment" });
  }
}

export async function getAppointments(req: AuthenticatedRequest, res: Response) {
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

export async function getAppointmentById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { id } = req.params as { id: string };
    const appt = await AppointmentModel.findById(id)
      .populate("patient", "name email")
      .populate("practitioner", "name email");
    if (!appt) return res.status(404).json({ message: "Appointment not found" });
    if (req.user.role === "patient" && String(appt.patient) !== req.user.userId)
      return res.status(403).json({ message: "Forbidden" });
    if (req.user.role === "practitioner" && String(appt.practitioner) !== req.user.userId)
      return res.status(403).json({ message: "Forbidden" });
    return res.json(appt);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch appointment" });
  }
}

export async function updateAppointmentById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role === "patient") return res.status(403).json({ message: "Patients cannot update appointments" });

    const { id } = req.params as { id: string };
    const { date, time, appointmentType, patientInfo, notes, status } = req.body as any;

    const appt = await AppointmentModel.findById(id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (String(appt.practitioner) !== req.user.userId) return res.status(403).json({ message: "Forbidden" });

    if (date !== undefined) appt.date = date;
    if (time !== undefined) appt.time = time;
    if (appointmentType !== undefined) appt.appointmentType = appointmentType;
    if (patientInfo !== undefined) appt.patientInfo = { ...appt.patientInfo.toObject?.(), ...patientInfo } as any;
    if (notes !== undefined) appt.notes = notes;
    if (status !== undefined) appt.status = status;

    await appt.save();
    return res.json(appt);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update appointment" });
  }
}

export async function deleteAppointmentById(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (req.user.role === "patient") return res.status(403).json({ message: "Patients cannot delete appointments" });

    const { id } = req.params as { id: string };
    const appt = await AppointmentModel.findById(id);
    if (!appt) return res.status(404).json({ message: "Appointment not found" });

    if (String(appt.practitioner) !== req.user.userId)
      return res.status(403).json({ message: "Forbidden" });

    await appt.deleteOne();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete appointment" });
  }
}


