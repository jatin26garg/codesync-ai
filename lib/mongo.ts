import mongoose from "mongoose";

const MONGO_URL = process.env.MONGO_URL;

let cachedConnection: typeof mongoose | null = null;

export async function mongo() {
    if (!MONGO_URL) {
        throw new Error("MONGO_URL is not defined");
    }

    if (cachedConnection && mongoose.connection.readyState === 1) {
        console.log("Using existing MongoDB connection");
        return cachedConnection;
    }

    try {
        cachedConnection = await mongoose.connect(MONGO_URL);

        console.log("MongoDB connected");

        return cachedConnection;
    } catch (error) {
        console.error("MongoDB connection failed");

        throw error;
    }
}