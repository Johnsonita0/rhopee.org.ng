# RHOPEE ID Verifier

A Vite + React landing page for ID barcode verification using Supabase.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Add your Supabase values:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run locally:

   ```bash
   npm run dev
   ```

## Vercel deployment

1. Push to GitHub.
2. Create a new Vercel project and connect it to this GitHub repo.
3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Build command: `npm run build`
5. Output directory: `dist`

## Supabase table schema suggestion

Create a table named `id_cards` with at least these columns:

- `id` - primary key (UUID or serial)
- `barcode` - text, unique
- `name` - text
- `status` - text
- `issued_at` - timestamp or date

Then allow public `SELECT` on `id_cards` if using anon key in the frontend.

## Project structure

- `src/App.jsx` — main app shell
- `src/components/Navbar.jsx` — sticky nav
- `src/components/Header.jsx` — landing header
- `src/components/Scanner.jsx` — barcode input form
- `src/components/ResultCard.jsx` — verification display
- `src/lib/supabaseClient.js` — Supabase client and query logic
- `vercel.json` — Vercel deployment config
