Moviefy — Documentatie Tehnica

1. Prezentare Generala
Moviefy este o aplicatie web pentru cautarea si explorarea filmelor, cu autentificare, watchlist persistent si un sistem de scor (gamification) asociat filmelor adaugate/sterse din watchlist.

Proiectul este construit cu Next.js (App Router) + TypeScript, foloseste NextAuth pentru autentificare si Redis pentru:
- stocarea utilizatorilor (username, hash parola, watchlist, scor)
- caching pentru rezultatele de cautare (24h)

Servicii externe:
- OMDb API pentru cautare si detalii filme
- imagini remote (configurate in Next.js) din image.tmdb.org si m.media-amazon.com


2. Obiective Tehnice
- Arhitectura moderna Next.js App Router (Server Components + Client Components) cu Server Actions.
- SSR/Server-side fetching: paginile protejate folosesc getServerSession() (server) iar datele de filme sunt preluate pe server prin Server Actions.
- Autentificare securizata cu NextAuth Credentials + parole hash-uite cu bcryptjs.
- Persistenta si performanta prin Redis (user store + cache rezultate).
- UI modern, responsive: TailwindCSS v4 + componente shadcn/ui (Radix UI).
- Functionalitati orientate pe UX:
  - cautare rapida cu incarcare incrementala (batch in background)
  - filtre + sortare
  - watchlist per utilizator + scor
  - share catre platforme sociale + link IMDb
- Testare automata cu Jest + ts-jest.
- Deploy pe platforma Vercel https://moviefy-henna.vercel.app/


3. Functionalitati
- Autentificare (Credentials)
  - register (creare utilizator)
  - login/logout
  - sesiune JWT (NextAuth)
- Cautare filme (OMDb)
  - search by title (cu paginare OMDb)
  - fetch detalii complete per imdbID
  - deduplicare rezultate (pe titlu)
- Poster & date complete in UI
  - afiseaza poster, titlu, an, rating, runtime si descriere (synopsis/plot)
- Filtrare & sortare
  - an (year)
  - gen (genre)
  - scor/rating range (0–10)
  - sortare dupa an / rating (asc/desc)
- Recomandari bazate pe rating (mesaj UI in card)
  - audience score >= 80% (echivalent rating >= 8/10): recomandat
  - audience score < 50% (echivalent rating < 5/10): nerecomandat
  - altfel: mixed
- Watchlist persistent (Redis)
  - toggle add/remove pe film
  - listare watchlist pentru utilizator
  - badge/indicator „in watchlist”
- Sistem de scor
  - puncte calculate din detaliile filmului (ex: filme noi, rating foarte mare)
  - scorul se actualizeaza la add/remove din watchlist
- Share
  - Facebook / Twitter(X) / WhatsApp folosind linkul IMDb al filmului


4. Tehnologii Utilizate
Frontend:
- Next.js 16
- React 19
- TypeScript
- TailwindCSS v4
- shadcn/ui + Radix UI
- embla-carousel-react (carousel pentru listare)
- lucide-react (icons)

Backend
- NextAuth v4 (Credentials)
- Next.js Route Handlers
- Next.js Server Actions
- Axios
- bcryptjs (hash/verify parole)

Stocare:
- Redis (utilizatori + watchlist + cache rezultate)

Testing:
- Jest + ts-jest


5. Metodologie Agile
Sprint-uri:
- Setup Next.js + UI (Tailwind/shadcn)
- Integrare OMDb: cautare + detalii filme
- Filtre + sortare + UX de listare (carousel)
- Redis cache pentru performanta
- Auth (Register/Login) + NextAuth Credentials
- Watchlist persistent + scor
- Teste Jest (auth + watchlist)

Flux dezvoltare:
1. Planificare -> 2. Design -> 3. Implementare -> 4. Testare -> 5. Evaluare -> 6. Retrospectiva -> 7. Sprint Urmator -> 1. Planificare (ciclu continuu)


6. Arhitectura Aplicatie
Moviefy ruleaza ca o aplicatie Next.js fullstack: UI + auth + logica server intr-un singur repo.

Componente principale si fluxul de date:
- Client (Browser):
   - UI (Componente Client): MovieSearch, MovieCard, AuthNav => apeleaza Server Actions si NextAuth Client.
   - Server Actions: fetchFirstPage, fetchBatchPages, operatiuni watchlist.
   - NextAuth Client: foloseste useSession, signIn, signOut.

- Next.js Server (App Router):
   - Route Handler: /api/auth/ => proceseaza auth.
   - Server Actions => comunica cu OMDb API si Redis.

- Servicii Externe:
   - OMDb API (date filme)

Interactiune UI -> Server:
UI cheama Server Action -> Server Action interogheaza Redis (cache/user) sau OMDb.
UI face trimitere directa catre IMDb (External Link).


7. Arhitectura Componentelor (UI)
Componentele sunt organizate ierarhic, separate in feature components si ui primitives (shadcn).

Structura ierarhica:
RootLayout (AuthProvider)
 |- Nav
     |- AuthNav
         |- WatchlistPage -> WatchlistContent -> MovieCard

Home (Pagina principala)
 |- MovieSearch
     |- SearchBar
     |- MovieFilters
     |- MovieList -> MovieCard -> WatchlistButton

Pagini de autentificare separate:
- LoginPage -> LoginForm
- RegisterPage -> RegisterForm

Obs: MovieCard este refolosit atat in MovieList (Cautare), cat si in WatchlistContent.


8. Documentatie API
In Moviefy exista atat API public (NextAuth via Route Handler), cat si API intern (Server Actions, folosit direct de componente).

Auth (NextAuth):
- Endpoint: /api/auth/[...nextauth]
- Rol: Gestioneaza fluxurile de login/logout, sesiune si JWT.

Server Actions (API intern, in lib/actions.ts):
- fetchFirstPage(movieName, filters?) -> Cauta filme in OMDb (pagina 1) + filtre + cache Redis.
- fetchBatchPages(movieName, endPage, filters?) -> Preia pagini multiple in fundal (batch), cache Redis.
- toggleWatchlist(imdbID) -> Adauga/sterge film din watchlist-ul utilizatorului si actualizeaza scorul.
- getWatchlistStatus(imdbID) -> Verifica daca un film este in watchlist.
- getWatchlistMovies() -> Returneaza lista de filme (detalii) pentru watchlist.
- getCurrentUser() -> Returneaza username + score pentru utilizatorul curent.

Server Actions autentificare (in lib/auth.ts):
- registerUser(username, password) -> Creeaza utilizator
- verifyCredentials(username, password) -> Verifica parola

Variabile de mediu (env):
- OMDB_API_KEY (Obligatoriu): Pentru cereri catre OMDb
- REDIS_URL (Obligatoriu): Conexiune Redis

Redis (Structura cheilor):
- User Store (key: user:<id>): JSON cu utilizatorul complet.
- Username Index (key: username:<username>): Referinta la ID utilizator.
- Cache cautare (key: "<nume_film>" sau "<nume>|year:<an>"): JSON cu rezultatele cautarii (TTL ~24h).


9. Rute Frontend
- / (Home): app/page.tsx - Pagina principala de cautare + rezultate + filtre (necesita login).
- /login: app/login/page.tsx - Formular autentificare.
- /register: app/register/page.tsx - Formular creare cont.
- /watchlist: app/watchlist/page.tsx - Pagina cu filmele salvate de utilizator (necesita login).


10. Concluzii
Moviefy este o aplicatie Next.js fullstack moderna, care implementeaza:
- Autentificare completa
- Performanta ridicata prin caching Redis 
- Stocare persistenta (Redis) pentru utilizatori si preferinte 
- UI modern si responsiv cu o experienta de utilizare fluida.
