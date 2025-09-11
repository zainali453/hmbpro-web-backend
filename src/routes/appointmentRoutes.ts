import { Router } from "express";
import { createAppointment, getMyAppointments } from "../controllers/appointmentController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createAppointment);
router.get("/mine", requireAuth, getMyAppointments);

export default router;


