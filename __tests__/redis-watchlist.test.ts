require('dotenv').config();
import { userStore } from "@/lib/redisUser";
import { toggleWatchlist, getWatchlistStatus } from "@/lib/actions";
import { getServerSession } from "next-auth";
import { User } from "@/lib/types";

jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("../lib/auth-options", () => ({
  authOptions: {},
}));

describe("Redis Watchlist Operations", () => {
  const testUserId = "test_user_auth_mock_456";
  const testUsername = "mockuser";
  const testMovieId = "tt0110912";

  const createMockUser = (): User => ({
    id: testUserId,
    username: testUsername,
    passwordHash: "hashedpassword",
    createdAt: new Date().toISOString(),
    watchlist: [],
    score: 0,
  });

  beforeEach(() => {
    (getServerSession as jest.Mock).mockResolvedValue({
      user: {
        id: testUserId,
        name: testUsername,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should update user watchlist in Redis when adding a movie", async () => {
    const initialUser = await userStore.getUserById(testUserId);
    const initialWatchlistLength = initialUser?.watchlist?.length || 0;
    const initialScore = initialUser?.score || 0;
    const isInitiallyInWatchlist = initialUser?.watchlist?.includes(testMovieId) || false;

    const addResult = await toggleWatchlist(testMovieId);
    
    if (isInitiallyInWatchlist) {
      const secondToggle = await toggleWatchlist(testMovieId);
      expect(secondToggle.success).toBe(true);
      expect(secondToggle.isInWatchlist).toBe(true);
    } else {
      expect(addResult.success).toBe(true);
      expect(addResult.isInWatchlist).toBe(true);
    }

    const updatedUser = await userStore.getUserById(testUserId);
    
    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.watchlist).toContain(testMovieId);
    expect(updatedUser?.watchlist.length).toBeGreaterThanOrEqual(1);
    expect(updatedUser?.score).toBeGreaterThan(0);

    const status = await getWatchlistStatus(testMovieId);
    expect(status.isInWatchlist).toBe(true);
  });

  test("should update user watchlist in Redis when removing a movie", async () => {
    const currentUser = await userStore.getUserById(testUserId);
    const isCurrentlyInWatchlist = currentUser?.watchlist?.includes(testMovieId) || false;
    
    if (!isCurrentlyInWatchlist) {
      await toggleWatchlist(testMovieId);
    }

    const userWithMovie = await userStore.getUserById(testUserId);
    const watchlistLengthWithMovie = userWithMovie?.watchlist?.length || 0;
    const scoreWithMovie = userWithMovie?.score || 0;

    expect(userWithMovie?.watchlist).toContain(testMovieId);

    const removeResult = await toggleWatchlist(testMovieId);
    expect(removeResult.success).toBe(true);
    expect(removeResult.isInWatchlist).toBe(false);

    const updatedUser = await userStore.getUserById(testUserId);
    
    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.watchlist).not.toContain(testMovieId);
    expect(updatedUser?.watchlist.length).toBe(watchlistLengthWithMovie - 1);
    expect(updatedUser?.score).toBeLessThan(scoreWithMovie);

    const status = await getWatchlistStatus(testMovieId);
    expect(status.isInWatchlist).toBe(false);
  });

  test("should maintain data consistency across multiple operations", async () => {
    const movieIds = ["tt0110912", "tt0361748", "tt7286456"];
    
    const initialUser = await userStore.getUserById(testUserId);
    const initialWatchlist = initialUser?.watchlist || [];
    
    for (const movieId of movieIds) {
      if (initialWatchlist.includes(movieId)) {
        await toggleWatchlist(movieId);
      }
    }
    for (const movieId of movieIds) {
      const result = await toggleWatchlist(movieId);
      expect(result.success).toBe(true);
      expect(result.isInWatchlist).toBe(true);
    }

    const user = await userStore.getUserById(testUserId);
    expect(user?.watchlist).toEqual(expect.arrayContaining(movieIds));

    for (const movieId of movieIds) {
      const result = await toggleWatchlist(movieId);
      expect(result.success).toBe(true);
      expect(result.isInWatchlist).toBe(false);
    }

    const finalUser = await userStore.getUserById(testUserId);
    movieIds.forEach(movieId => {
      expect(finalUser?.watchlist).not.toContain(movieId);
    });
  });
});