# ORBIT — Cinematic Streaming

A free movie and TV streaming site built with TanStack Start, React 19, and Tailwind CSS.

## Features

- Movies, TV shows, and anime powered by TMDB API
- Video playback via Videasy player
- Full-text search across movies and series
- AI Movie Concierge (Claude-powered recommendations)
- Auth + user profiles via Supabase
- Cross-device watchlist sync
- Fully responsive

## Tech Stack

- **Framework:** TanStack Start (SSR) + TanStack Router
- **UI:** React 19 + Tailwind CSS v4
- **Data:** TMDB API v3
- **Player:** Videasy
- **Auth/DB:** Supabase
- **AI:** Anthropic Claude (Haiku)
- **Deployment:** Cloudflare Pages

## Environment Variables

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
ANTHROPIC_API_KEY=your_anthropic_key

## Development

npm install
npm run dev

## Build

npm run build
