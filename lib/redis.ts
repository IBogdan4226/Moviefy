import { createClient } from "redis";
import { MovieData } from "./types";

//if no process.env.redis_url, throw error
if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL environment variable is not set");
}

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on("error", (err) => console.error("Redis Client Error", err));

let isConnected = false;

async function connectRedis() {
  if (!isConnected) {
    await redisClient.connect();
    isConnected = true;
  }
}

export interface CacheEntry {
  movies: MovieData[];
}

class RedisCache {
  private readonly CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

  async get(key: string): Promise<CacheEntry | null> {
    try {
      await connectRedis();
      const data = await redisClient.get(key);
      if (!data) return null;

      return JSON.parse(data);
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  }

  async set(key: string, value: CacheEntry): Promise<void> {
    try {
      await connectRedis();
      await redisClient.set(
        key,
        JSON.stringify(value),
        { EX: Math.floor(this.CACHE_DURATION / 1000) } // Set expiration in seconds
      );
    } catch (error) {
      console.error("Redis set error:", error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await connectRedis();
      await redisClient.del(key);
    } catch (error) {
      console.error("Redis delete error:", error);
    }
  }
}

export const searchCache = new RedisCache();
