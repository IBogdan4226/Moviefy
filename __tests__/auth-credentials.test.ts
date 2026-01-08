require('dotenv').config();
import { verifyCredentials } from "@/lib/auth";
import { userStore } from "@/lib/redisUser";
import bcrypt from "bcryptjs";

describe("Authentication Credentials Verification", () => {
  const testUsername = "test1234";
  const testPassword = "1qaz2wsx";
  const testUserId = "test-user-auth-id";

  beforeAll(async () => {
    const passwordHash = await bcrypt.hash(testPassword, 10);
    
    const testUser = {
      id: testUserId,
      username: testUsername,
      passwordHash: passwordHash,
      createdAt: new Date().toISOString(),
      watchlist: [],
      score: 0,
    };

    await userStore.createUser(testUser);
  });

  test("should verify credentials correctly with valid username and password", async () => {
    const user = await verifyCredentials(testUsername, testPassword);

    expect(user).not.toBeNull();
    expect(user?.username).toBe(testUsername);
    expect(user?.id).toBe(testUserId);
    expect(user?.passwordHash).toBeDefined();
  });

  test("should reject invalid password", async () => {
    const wrongPassword = "wrongPassword123";
    const user = await verifyCredentials(testUsername, wrongPassword);

    expect(user).toBeNull();
  });

  test("should reject non-existent username", async () => {
    const nonExistentUser = "nonexistentuser999";
    const user = await verifyCredentials(nonExistentUser, testPassword);

    expect(user).toBeNull();
  });

  test("should reject empty credentials", async () => {
    const userWithEmptyPassword = await verifyCredentials(testUsername, "");
    expect(userWithEmptyPassword).toBeNull();

    const userWithEmptyUsername = await verifyCredentials("", testPassword);
    expect(userWithEmptyUsername).toBeNull();
  });

  test("should handle case-sensitive usernames", async () => {
    const uppercaseUsername = testUsername.toUpperCase();
    const user = await verifyCredentials(uppercaseUsername, testPassword);

    expect(user).toBeNull();
  });

  test("should verify password hash is secure", async () => {
    const user = await verifyCredentials(testUsername, testPassword);

    expect(user).not.toBeNull();
    expect(user?.passwordHash).not.toBe(testPassword);
    expect(user?.passwordHash).toMatch(/^\$2[ab]\$/);
  });

  test("should return complete user object on successful verification", async () => {
    const user = await verifyCredentials(testUsername, testPassword);

    expect(user).not.toBeNull();
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("username");
    expect(user).toHaveProperty("passwordHash");
    expect(user).toHaveProperty("createdAt");
    expect(user).toHaveProperty("watchlist");
    expect(user).toHaveProperty("score");
    expect(Array.isArray(user?.watchlist)).toBe(true);
    expect(typeof user?.score).toBe("number");
  });
});