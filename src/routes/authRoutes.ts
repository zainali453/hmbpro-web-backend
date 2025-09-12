
import { Router } from "express";
import { login, signup, me } from "../controllers/authController";
import { requireAuth } from "../middleware/auth";
import upload from "../middleware/upload";


const router = Router();

// Use multer middleware for profilePicture upload (field name: profilePicture)
router.post("/signup", upload.single("profilePicture"), signup);
router.post("/login", login);
router.get("/me", requireAuth, me);

export default router;


