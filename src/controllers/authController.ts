import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel, UserRole } from "../models/User";
import { env } from "../config/env";
import { AuthenticatedRequest } from "../middleware/auth";

function signToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, env.jwtSecret, { expiresIn: "7d" });
}

export async function signup(req: Request, res: Response) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      dateOfBirth,
      placeOfBirth,
      phone,
      concern,
      agreeToTerms,
      agreeToPrivacy
    } = req.body;

    // Accept boolean true or string 'true' for agreeToTerms and agreeToPrivacy
    const agreeToTermsBool = agreeToTerms === true || agreeToTerms === "true";
    const agreeToPrivacyBool = agreeToPrivacy === true || agreeToPrivacy === "true";

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !dateOfBirth || !phone || !concern || !agreeToTermsBool || !agreeToPrivacyBool) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);

    // Handle profilePicture upload (multer will add req.file if present)
    let profilePicture: string | undefined = undefined;
    if (req.file) {
      profilePicture = req.file.path;
    }

    const user = await UserModel.create({
      firstName,
      lastName,
      email,
      passwordHash,
      dateOfBirth,
      placeOfBirth,
      phone,
      concern,
      profilePicture,
      agreeToTerms: agreeToTermsBool,
      agreeToPrivacy: agreeToPrivacyBool,
      role: "patient"
    });

    const token = signToken(user.id, user.role);
    return res.status(201).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Signup failed" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return res.status(400).json({ message: "Missing email or password" });
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken(user.id, user.role);
    return res.status(200).json({ 
      token, 
      user: { 
        id: user.id, 
        firstName: user.firstName, 
        lastName: user.lastName, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await UserModel.findById(req.user.userId).select("firstName lastName email role");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ 
      id: user.id, 
      firstName: user.firstName, 
      lastName: user.lastName, 
      email: user.email, 
      role: user.role 
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}


