import { Bookmark } from "lucide-react";
import { WatchlistContent } from "@/components/watchlist-content";
import { Nav } from "@/components/nav";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function WatchlistPage() {
     const session = await getServerSession(authOptions);
    
      if (!session) {
        redirect("/login");
      }
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Nav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bookmark className="h-8 w-8" />
            <h1 className="text-4xl font-bold">My Watchlist</h1>
          </div>
          <p className="text-muted-foreground">
            Movies you've saved to watch later
          </p>
        </div>

        <WatchlistContent />
      </main>
    </div>
  );
}
