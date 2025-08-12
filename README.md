<<<<<<< HEAD
# ClearTx (MVP)

A privacy-first multi-bank transaction labeling tool.

## Scripts

- `npm run dev` – start dev server
- `npm run build` – build for production
- `npm run preview` – preview production build
- `npm run deploy` – deploy `dist` to GitHub Pages

## Deploy to GitHub Pages

1. Set `base` in `vite.config.ts` to `'/<repo-name>/'` if deploying to a project site.
2. Run `npm run deploy` (this builds then publishes `dist` to the `gh-pages` branch).

## Tech

- React + Vite
- Tailwind CSS
- React Router
- LocalStorage for persistence

### Data models

- Account: `{ id, nickname, maskedNumber }`
- Transaction: `{ id, amount, date, note?, accountId }`
=======
# cleartx
>>>>>>> f6d2eb3aa4d1442b76445bdcfcc95a78e28a9e50
