# fashion-styled

Style your fashion using AI.

## Forme — Fashion Style Board AI

A responsive fashion styling frontend built with React, TypeScript, and Vite. It includes a landing page, style journal, deterministic sample outfit generator, saved style board, and a locally stored digital wardrobe.

## Run locally

Requirements: Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. User-created wardrobe entries, saved looks, and generated sample ideas are stored in this browser using `localStorage`.

## Build

```sh
npm run build
npm run preview
```

## Current scope

The outfit generator uses deterministic demo recommendations and editorial imagery. The app does not yet connect to an AI provider, database, authentication service, image upload provider, or weather service. Browser storage is for the local demo only; it is not suitable for private accounts or shared production data. Login and registration, backend authorization, persistent MongoDB storage, provider integrations, and deployment configuration remain to be implemented before production use.

Images are loaded from Unsplash and require an internet connection. The generator labels its suggestions as demo styling ideas and does not claim that imagery depicts exact garments.

## GitHub repository

https://github.com/Saidev007/fashion-styled

## Deploy to Vercel

Import this GitHub repository in Vercel. Vercel detects Vite automatically; use `npm run build` as the build command and `dist` as the output directory if prompted. The included rewrite keeps client-side routes working when opened directly.

## Magic Camera

The Magic Camera processes normal captures and edits in the browser. The local gallery stores image blobs in IndexedDB on this device; clearing browser site data can remove them. The optional AI action sends the selected photo to OpenAI only after the consent checkbox is selected.

For local camera use, open `http://localhost:5173` in a browser that supports `getUserMedia`. Device camera access requires HTTPS outside localhost. Start the API and frontend in separate terminals:

```sh
npm run server:dev
npm run dev
```

To enable AI image edits, set `AI_PROVIDER=openai`, `AI_MODEL=gpt-image-2`, and `AI_API_KEY` in the server environment. Keep the key server-side; never use a `VITE_` prefix. With the default `AI_PROVIDER=demo`, the UI remains available and the API returns a configuration message. The provider call uses OpenAI's Images edits endpoint and has not been live-tested without credentials. The endpoint has a best-effort per-instance request cap; configure edge-level rate limiting before exposing a paid provider key publicly.

Vercel serves the frontend build and routes API requests through `api/[...path].ts`. Configure `AI_PROVIDER`, `AI_MODEL`, and `AI_API_KEY` in the Vercel project environment. Camera hardware and the configured AI provider need browser/device access and credentials and cannot be verified by the local build alone.

Backend tests after compilation: `npm run server:build` followed by `node --test dist-server/server/tests/auth.test.js`.
