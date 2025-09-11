import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { updateMe, deleteMe } from "../controllers/userController";

const router = Router();

router.put("/me", requireAuth, updateMe);
router.delete("/me", requireAuth, deleteMe);

export default router;
