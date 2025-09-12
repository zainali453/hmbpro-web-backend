import "dotenv/config";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function setupAndStart() {
  console.log("🚀 Starting HMBPro Backend Setup...\n");

  try {
    // Set environment variables
    process.env.MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/hmbpro";
    process.env.JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key";
    process.env.PORT = process.env.PORT || "3000";
    process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

    console.log("📋 Environment Variables Set:");
    console.log(`   MONGODB_URI: ${process.env.MONGODB_URI}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '***' : 'NOT SET'}`);
    console.log(`   PORT: ${process.env.PORT}`);
    console.log(`   CORS_ORIGIN: ${process.env.CORS_ORIGIN}\n`);

    // Check if MongoDB is running
    console.log("🔍 Checking MongoDB connection...");
    try {
      const { spawn } = require('child_process');
      const mongoose = require('mongoose');
      
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("✅ MongoDB connection successful");
      await mongoose.disconnect();
    } catch (error) {
      console.log("❌ MongoDB connection failed. Please make sure MongoDB is running.");
      console.log("   Start MongoDB with: mongod");
      process.exit(1);
    }

    // Seed practitioners
    console.log("\n🌱 Seeding practitioners...");
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);
      
      await execAsync('npm run seed:practitioners');
      console.log("✅ Practitioners seeded successfully");
    } catch (error) {
      console.log("⚠️ Failed to seed practitioners, but continuing...");
    }

    console.log("\n🎉 Setup complete! You can now start the backend server with:");
    console.log("   npm run dev:tsnd");
    console.log("\n📝 Make sure to also start the frontend with:");
    console.log("   cd ../hmbpro-web-frontend && npm run dev");

  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

setupAndStart();
