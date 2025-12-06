import { Film } from "lucide-react";
import { AuthNav } from "./auth-nav";
import Link from "next/link";

export const Nav = () => {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Moviefy</span>
          </Link>
        </div>
        <AuthNav />
      </div>
    </header>
  );
};
