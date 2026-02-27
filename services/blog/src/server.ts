import express from "express";
import dotenv from "dotenv";
import blogRoutes from "./routes/blog.js";
import { createClient } from "redis";
import { startCacheConsumer } from "./utils/consumer.js";
import cors from "cors"


dotenv.config();

const app = express();

app.use(express.json())
app.use(cors)

// ✅ Always fallback
const port = process.env.PORT || 3001;

startCacheConsumer();

// ---------------- REDIS SETUP ----------------
export const redisClient = createClient({
  url: process.env.REDIS_URL as string,
});

// 🔥 REQUIRED: error handler
redisClient.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

redisClient.on("connect", () => {
  console.log("🔗 Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("✅ Connected to redis!");
});

redisClient.on("end", () => {
  console.warn("⚠️ Redis connection closed");
});

// connect (non-blocking)
redisClient.connect().catch((err) => {
  console.error("❌ Redis connection failed:", err.message);
});
// ------------------------------------------------

app.use(express.json());
app.use("/api/v1", blogRoutes);

app.listen(port, () => {
  console.log(`👍 Server is live on http://localhost:${port}`);
});