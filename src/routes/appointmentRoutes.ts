import { Router } from "express";
import * as appointmentController from "../controllers/appointmentController";
import { requireAuth, requireRoles } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, requireRoles("patient"), (req, res) => appointmentController.createAppointment(req, res));
router.get("/", requireAuth, (req, res) => appointmentController.getAppointments(req, res));
router.get("/mine", requireAuth, (req, res) => appointmentController.getMyAppointments(req, res));
router.get("/:id", requireAuth, (req, res) => appointmentController.getAppointmentById(req, res));
router.put("/:id", requireAuth, requireRoles("practitioner"), (req, res) => appointmentController.updateAppointmentById(req, res));
router.delete("/:id", requireAuth, requireRoles("practitioner"), (req, res) => appointmentController.deleteAppointmentById(req, res));

export default router;


