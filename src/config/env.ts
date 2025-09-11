import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  mongoUri: process.env.MONGODB_URI || "",
  jwtSecret: process.env.JWT_SECRET || "change-me-in-env",
  nodeEnv: process.env.NODE_ENV || "development",
  corsOrigin: process.env.CORS_ORIGIN || "*",
};

if (!env.mongoUri) {
  // eslint-disable-next-line no-console
  console.warn("MONGODB_URI is not set. Please set it in .env");
}

if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn("JWT_SECRET is not set. Using a default insecure secret.");
}


