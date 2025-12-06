import { MovieSearch } from '@/components/movie-search';
import { AuthNav } from '@/components/auth-nav';
import { Film } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Moviefy</span>
          </div>
          <AuthNav />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-8 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Film className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Moviefy
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover movies, check ratings, and get personalized recommendations
          </p>
        </div>

        <MovieSearch />
      </main>
    </div>
  );
}
