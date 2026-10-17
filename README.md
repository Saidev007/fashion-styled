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

The outfit generator uses deterministic demo recommendations and editorial imagery. The interface stores the user's current style board and closet locally in the browser; the API also includes MongoDB-backed authentication and wardrobe routes. The Magic Camera's photo gallery is stored separately in IndexedDB on the current device.

Images are loaded from Unsplash and require an internet connection. The generator labels its suggestions as demo styling ideas and does not claim that imagery depicts exact garments.

## GitHub repository

https://github.com/Saidev007/fashion-styled

## Deploy to Vercel

Import this GitHub repository in Vercel. Vercel detects Vite automatically; use `npm run build` as the build command and `dist` as the output directory if prompted. The included rewrite keeps client-side routes working when opened directly.

## Magic Camera

The Magic Camera processes normal captures and edits in the browser. The local gallery stores image blobs in IndexedDB on this device; clearing browser site data can remove them. Its optional virtual try-on sends the selected photo and clothing description to OpenAI only after the consent checkbox is selected, then offers three generated outfit variations to choose from.

For local camera use, open `http://localhost:5173` in a browser that supports `getUserMedia`. Device camera access requires HTTPS outside localhost. Start the API and frontend in separate terminals:

```sh
npm run server:dev
npm run dev
```

To enable AI virtual try-on, set `AI_PROVIDER=openai`, `AI_MODEL=gpt-image-2`, and `AI_API_KEY` in the server environment. Keep the key server-side; never use a `VITE_` prefix. With the default `AI_PROVIDER=demo`, the UI remains available and the API returns a configuration message. The provider call uses OpenAI's Images edits endpoint and has not been live-tested without credentials. The endpoint has a best-effort per-instance request cap; configure edge-level rate limiting before exposing a paid provider key publicly.

Vercel serves the frontend build and routes API requests through `api/[...path].ts`. Configure `MONGODB_URI`, `SESSION_SECRET`, and `JWT_SECRET` for the backend; production session and JWT secrets must each be at least 32 characters. Set `APP_URL` to the deployed site origin. To enable virtual try-on, also configure `AI_PROVIDER=openai`, `AI_MODEL`, and the server-only `AI_API_KEY`. Camera hardware and the configured AI provider need browser/device access and credentials and cannot be verified by the local build alone.

Backend tests after compilation: `npm run server:build` followed by `node --test dist-server/server/tests/auth.test.js`.
