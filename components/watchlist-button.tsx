"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleWatchlist, getWatchlistStatus } from "@/lib/actions";

interface WatchlistButtonProps {
  imdbID: string;
  onToggle?: (isInWatchlist: boolean, imdbID: string) => void;
}

export function WatchlistButton({ imdbID, onToggle }: WatchlistButtonProps) {
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    const checkWatchlistStatus = async () => {
      if (session?.user) {
        const status = await getWatchlistStatus(imdbID);
        setIsInWatchlist(status.isInWatchlist);
      }
    };
    checkWatchlistStatus();
  }, [imdbID, session]);

  const handleWatchlistToggle = async () => {
    if (!session?.user) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleWatchlist(imdbID);
      if (result.success) {
        setIsInWatchlist(result.isInWatchlist);
        onToggle?.(result.isInWatchlist, imdbID);
      }
    } catch (error) {
      console.error("Failed to toggle watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <Button
      variant={isInWatchlist ? "default" : "ghost"}
      size="icon"
      className="h-8 w-8"
      onClick={handleWatchlistToggle}
      disabled={isLoading}
      title={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
    >
      <Bookmark className={`h-4 w-4 ${isInWatchlist ? "fill-current" : ""}`} />
    </Button>
  );
}
