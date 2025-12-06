import { createClient } from "redis";
import { User } from "./types";

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

class UserStore {
  private readonly USER_PREFIX = "user:";
  private readonly USERNAME_INDEX = "username:";

  async createUser(user: User): Promise<void> {
    try {
      await connectRedis();
      await redisClient.set(`${this.USER_PREFIX}${user.id}`, JSON.stringify(user));
      await redisClient.set(`${this.USERNAME_INDEX}${user.username}`, user.id);
    } catch (error) {
      console.error("Redis createUser error:", error);
      throw error;
    }
  }

  async updateUser(user: User): Promise<void> {
    try {
      await connectRedis();
      await redisClient.set(`${this.USER_PREFIX}${user.id}`, JSON.stringify(user));
    } catch (error) {
      console.error("Redis updateUser error:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      await connectRedis();
      const userId = await redisClient.get(`${this.USERNAME_INDEX}${username}`);
      if (!userId) return null;
      
      const userData = await redisClient.get(`${this.USER_PREFIX}${userId}`);
      if (!userData) return null;

      return JSON.parse(userData);
    } catch (error) {
      console.error("Redis getUserByUsername error:", error);
      return null;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      await connectRedis();
      const userData = await redisClient.get(`${this.USER_PREFIX}${id}`);
      if (!userData) return null;

      return JSON.parse(userData);
    } catch (error) {
      console.error("Redis getUserById error:", error);
      return null;
    }
  }
}

export const userStore = new UserStore();
