# Spotify ↔ YouTube Music Transfer

This app lets you sign in to Spotify and YouTube Music, browse your playlists and move tracks between the two services. It is built with React, TypeScript, Vite and uses **pnpm** for dependency management. All styling is done with inline CSS.

## Setup

1. Install dependencies:
   ```sh
   pnpm install
   ```
2. Create a `.env` file with your OAuth client ids:
   ```
   VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
   VITE_YOUTUBE_CLIENT_ID=your_google_client_id
   ```
   The app uses implicit grant OAuth flows. Set the redirect URI of both clients to the origin where the app runs (e.g. `http://localhost:5173`).

## Development

Run the development server:
```sh
pnpm dev
```

## Build
```sh
pnpm build
```

Once authenticated, playlists are fetched from both services. Clicking a playlist shows its tracks. Tracks can be transferred to the currently selected playlist on the opposite platform.
