# PWA Implementation Details

## Overview
We have enabled Progressive Web App (PWA) capabilities for your Next.js AI Chatbot. The app is now installable on Android, iOS, and Desktop, featuring a service worker for caching and offline support.

## Files Added/Modified

1.  **`public/manifest.json`**: Defines app metadata (name, icons, theme color).
2.  **`public/icons/icon.svg`**: A generated SVG icon for the app (placeholder for a real logo).
3.  **`components/pwa-install-prompt.tsx`**: A custom component that handles the install prompt:
    *   Listens for `beforeinstallprompt` (Android/Desktop).
    *   Detects iOS/Safari to show a custom modal with instructions.
    *   Subtle "Install App" button matching the cyberpunk theme.
4.  **`app/layout.tsx`**:
    *   Injected `<PWAInstallPrompt />`.
    *   Added PWA metadata (`manifest`, `themeColor`).
5.  **`next.config.ts`**: Wrapped configuration with `@ducanh2912/next-pwa` to generate the Service Worker during build.
6.  **Dependencies**: Installed `@ducanh2912/next-pwa`.

## How to Test PWA on Vercel

1.  **Deploy**: Push the changes to your main branch. Vercel will build and deploy.
2.  **Verify Manifest**:
    *   Open your specific deployment URL.
    *   Open DevTools (F12) -> Application -> Manifest.
    *   Ensure no errors and that the icon is loaded.
3.  **Verify Service Worker**:
    *   DevTools -> Application -> Service Workers.
    *   You should see a registered worker source `sw.js`.
4.  **Test Install**:
    *   **Desktop (Chrome/Edge)**: You should see the "Install App" button in the bottom right (unless you are already installed). Click it to trigger the native prompt.
    *   **Mobile (Android)**: Open in Chrome. The button should appear.
    *   **iOS (Safari)**: Open in Safari. The button should appear. Clicking it will show instructions to tap "Share" -> "Add to Home Screen".

## Common Pitfalls & Solutions

1.  **Icon Issues**: Ensure `public/icons/icon.svg` is accessible. If you replace it with a PNG, update `manifest.json` types and paths. PWA works best with 192x192 and 512x512 PNGs.
2.  **Service Worker Caching**:
    *   If API responses are being cached improperly, check `next.config.ts`. The default configuration avoids caching `/api` routes heavily, but if you see stale LLM responses, you may need to add a specific `runtimeCaching` rule to `networkOnly` for `/api/*`.
3.  **Development Mode**:
    *   PWA generation is disabled in development (`npm run dev`) by default in `next.config.ts` to facilitate hot reloading. Use `npm run build` and `npm start` locally to test the PWA fully.

## Bonus Features
- **Analytics**: The component logs success toast on install.
- **Theme**: The install button uses glassmorphism and neon glows to match your theme.
