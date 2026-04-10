# SmartArogya AI

This repository contains:

- `backend/` — Python Flask API with Google Sheets, JWT, and ML predictions
- `smartarogya-frontend/` — React + Vite frontend

## Live deployment plan

1. Deploy the backend on Render using `backend/`.
2. Deploy the frontend on GitHub Pages from `smartarogya-frontend/`.
3. Set `VITE_API_BASE_URL` in `smartarogya-frontend/.env` to your backend URL.
4. Keep `backend/credentials.json` out of GitHub and instead use `GOOGLE_CREDENTIALS_JSON` as a Render secret.

## Backend (Render)

- Use `backend/Procfile`:
  ```text
  web: gunicorn app:app
  ```
- Install dependencies from `backend/requirements.txt`.
- Set secret env var `GOOGLE_CREDENTIALS_JSON` with your Google service account JSON.

## Frontend (GitHub Pages)

1. Add `homepage` in `smartarogya-frontend/package.json`:
   ```json
   "homepage": "https://priyanshupatel2722005-sys.github.io/SmartArogya-AI"
   ```
2. Install `gh-pages` and deploy with:
   ```bash
   cd smartarogya-frontend
   npm install gh-pages --save-dev
   npm run deploy
   ```

## Important

- Do not push `backend/credentials.json` to GitHub.
- Do not push `backend/venv/`, `smartarogya-frontend/node_modules/`, or `smartarogya-frontend/dist/`.
