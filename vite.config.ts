import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//
// `base` controls the public path the app is served from. GitHub Pages project
// sites live under `/<repo>/`, so the deploy workflow sets PORTAL_BASE (e.g.
// "/portal/"). Locally it defaults to "/". This keeps the same build working in
// both places without code changes — set it at deploy time, not in source.
export default defineConfig({
  base: process.env.PORTAL_BASE ?? '/',
  plugins: [react()],
})
