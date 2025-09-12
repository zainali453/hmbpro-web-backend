import { Router } from "express";
import { getPractitioners, getPractitionerById, getPractitionerTimeSlots } from "../controllers/practitionerController";
import { requireAuth } from "../middleware/auth";

const router = Router();

// Get all practitioners
router.get("/", requireAuth, getPractitioners);

// Get practitioner by ID
router.get("/:id", requireAuth, getPractitionerById);

// Get practitioner time slots
router.get("/:id/time-slots", requireAuth, getPractitionerTimeSlots);

export default router;
