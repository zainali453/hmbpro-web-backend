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
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    if (!name || !email || !password) return res.status(400).json({ message: "Missing required fields" });
    const existing = await UserModel.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already in use" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ name, email, passwordHash, role: "patient" });
    const token = signToken(user.id, user.role);
    return res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
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
    return res.status(200).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
}

export async function me(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const user = await UserModel.findById(req.user.userId).select("name email role");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
}


