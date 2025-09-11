import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { env } from "../src/config/env";
import { UserModel } from "../src/models/User";

function parseArgs() {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith("--") ? args[++i] : "";
      out[key] = val;
    }
  }
  // Fallback to positional args: email, password, name (name may contain spaces)
  if (!out.email && args[0] && !args[0].startsWith("--")) out.email = args[0];
  if (!out.password && args[1] && !args[1].startsWith("--")) out.password = args[1];
  if (!out.name && args[2] && !args[2].startsWith("--")) out.name = args.slice(2).join(" ");
  return out as { email?: string; password?: string; name?: string };
}

async function main() {
  const { email, password, name } = parseArgs();
  if (!email || !password || !name) {
    console.error("Usage:");
    console.error("  npm run create:practitioner -- --email user@example.com --password secret --name \"Full Name\"");
    console.error("  npm run create:practitioner -- user@example.com secret \"Full Name\"");
    console.error("  npx ts-node scripts/createPractitioner.ts --email user@example.com --password secret --name \"Full Name\"");
    process.exit(1);
  }

  if (!env.mongoUri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(env.mongoUri);

  const existing = await UserModel.findOne({ email });
  if (existing) {
    console.error("User with this email already exists");
    await mongoose.disconnect();
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await UserModel.create({ name, email, passwordHash, role: "practitioner" });
  console.log("✅ Practitioner created:", { id: user.id, email: user.email, name: user.name, role: user.role });
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
