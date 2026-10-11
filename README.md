# Forme — Fashion Style Board AI

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

## Publish to GitHub

Create an empty repository on GitHub, then from this project folder run:

```sh
git init
git add .
git commit -m "Build Forme fashion styling app"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

Replace the remote URL with your repository URL. Never commit `.env` files, API keys, or other credentials.
