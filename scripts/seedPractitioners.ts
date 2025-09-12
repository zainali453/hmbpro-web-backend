import "dotenv/config";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { env } from "../src/config/env";
import { UserModel } from "../src/models/User";

const practitioners = [
  {
    firstName: "Dr. Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@hmbpro.com",
    password: "password123",
    phone: "555-0101",
    concern: "Anxiety & Stress Management",
    specializations: ["Anxiety", "Stress", "Mindfulness"]
  },
  {
    firstName: "Dr. Michael",
    lastName: "Chen",
    email: "michael.chen@hmbpro.com",
    password: "password123",
    phone: "555-0102",
    concern: "Neurofeedback & Brain Training",
    specializations: ["Neurofeedback", "ADHD", "Cognitive Training"]
  },
  {
    firstName: "Dr. Emily",
    lastName: "Rodriguez",
    email: "emily.rodriguez@hmbpro.com",
    password: "password123",
    phone: "555-0103",
    concern: "Chronic Pain & Physical Therapy",
    specializations: ["Chronic Pain", "Physical Therapy", "Biofeedback"]
  },
  {
    firstName: "Dr. James",
    lastName: "Wilson",
    email: "james.wilson@hmbpro.com",
    password: "password123",
    phone: "555-0104",
    concern: "Trauma & PTSD Treatment",
    specializations: ["PTSD", "Trauma", "EMDR"]
  },
  {
    firstName: "Dr. Lisa",
    lastName: "Thompson",
    email: "lisa.thompson@hmbpro.com",
    password: "password123",
    phone: "555-0105",
    concern: "Pediatric ADHD & Learning Disorders",
    specializations: ["Pediatric ADHD", "Learning Disorders", "Child Psychology"]
  },
  {
    firstName: "Dr. Robert",
    lastName: "Kumar",
    email: "robert.kumar@hmbpro.com",
    password: "password123",
    phone: "555-0106",
    concern: "Cardiovascular Health & Heart Rate Variability",
    specializations: ["Cardiovascular Health", "HRV", "Stress Management"]
  }
];

// Generate random time slots for each practitioner
function generateTimeSlots() {
  const slots = [];
  const startHour = 9;
  const endHour = 17;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const isAvailable = Math.random() > 0.3; // 70% chance of being available
      
      slots.push({
        time: timeString,
        available: isAvailable
      });
    }
  }
  
  return slots;
}

async function main() {
  if (!env.mongoUri) {
    console.error("MONGODB_URI is not set");
    process.exit(1);
  }

  try {
    await mongoose.connect(env.mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing practitioners
    await UserModel.deleteMany({ role: "practitioner" });
    console.log("🗑️ Cleared existing practitioners");

    // Create practitioners
    for (const practitioner of practitioners) {
      const existing = await UserModel.findOne({ email: practitioner.email });
      if (existing) {
        console.log(`⚠️ Practitioner ${practitioner.email} already exists, skipping...`);
        continue;
      }

      const passwordHash = await bcrypt.hash(practitioner.password, 10);
      const user = await UserModel.create({
        firstName: practitioner.firstName,
        lastName: practitioner.lastName,
        email: practitioner.email,
        passwordHash,
        dateOfBirth: new Date('1980-01-01'),
        phone: practitioner.phone,
        concern: practitioner.concern,
        agreeToTerms: true,
        agreeToPrivacy: true,
        role: "practitioner",
        specializations: practitioner.specializations,
        timeSlots: generateTimeSlots()
      });

      console.log(`✅ Created practitioner: ${user.firstName} ${user.lastName} (${user.email})`);
    }

    console.log("🎉 All practitioners created successfully!");
    console.log("📋 Practitioner IDs:");
    
    const createdPractitioners = await UserModel.find({ role: "practitioner" });
    createdPractitioners.forEach(p => {
      console.log(`  - ${p._id}: ${p.firstName} ${p.lastName} (${p.email})`);
    });

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

main();
