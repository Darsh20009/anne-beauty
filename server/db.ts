import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  // Don't throw error during build time if env is missing
  if (process.env.NODE_ENV === "production") {
    console.warn("Warning: MONGODB_URI is not set. Database operations will fail.");
  }
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) return;
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be set.");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export default mongoose;
