const Redis = require("ioredis");
require("dotenv").config();

// Upstash Redis URL se connect kar rahe hain
const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => {
  console.log("🔥 Redis Cache Connected Successfully!");
});

redis.on("error", (err) => {
  console.error("Redis Connection Error:", err);
});

module.exports = redis;
