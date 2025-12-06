"use server";

import bcrypt from "bcryptjs";
import { User } from "./types";
import { userStore } from "./redisUser";

export async function registerUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!username || username.trim().length < 3) {
      return { success: false, error: "Username must be at least 3 characters long" };
    }
    
    if (!password || password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long" };
    }

    const existingUser = await userStore.getUserByUsername(username);
    if (existingUser) {
      return { success: false, error: "Username already exists" };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      username: username.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
      watchlist: [],
    };

    await userStore.createUser(user);

    return { success: true };
  } catch (error) {
    console.error("Register user error:", error);
    return { success: false, error: "Failed to register user" };
  }
}

export async function verifyCredentials(username: string, password: string): Promise<User | null> {
  try {
    const user = await userStore.getUserByUsername(username);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Verify credentials error:", error);
    return null;
  }
}
