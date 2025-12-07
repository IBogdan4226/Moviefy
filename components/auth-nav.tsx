"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { User, LogOut, Bookmark, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/actions";

let scoreCache: number | null = null;

export function AuthNav() {
  const { data: session, status } = useSession();
  const [score, setScore] = useState<number>(scoreCache ?? 0);

  const loadUserData = async () => {
    const result = await getCurrentUser();
    if (result.success && result.user) {
      setScore(result.user.score);
      scoreCache = result.user.score;
    }
  };

  useEffect(() => {
    if (session?.user) {
      loadUserData();
    }
  }, [session]);

  useEffect(() => {
    const handleScoreChange = () => {
      loadUserData();
    };

    window.addEventListener("watchlistChanged", handleScoreChange);
    
    return () => {
      window.removeEventListener("watchlistChanged", handleScoreChange);
    };
  }, []);

  if (status === "loading") {
    return null;
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4" />
          <span className="font-medium">{session.user.name}</span>
          <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-primary/10 rounded-md">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="font-bold text-primary">{score}</span>
          </div>
        </div>
        <Link href="/watchlist">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Watchlist
          </Button>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut()}
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    );
  }
}
