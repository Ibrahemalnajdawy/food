# WorldTable — Worldwide Recipes

React + Express starter for a global recipe explorer. The API key stays on the server.

## Project structure
- `client/` React + Vite frontend
- `server/` Express API proxy

## 1. API key
Create a Food Tales developer key from the official dashboard. The API currently documents `X-Api-Key` authentication, Recipe API dish search at `/v1/recipes/search`, and cook search at `/v1/recipes/cook-search`.
Docs: https://foodtales.ai/docs/quickstart

Never put the key in any `VITE_` variable or frontend file.

## 2. Run locally
Open two terminals.

Server:
```bash
cd server
npm install
cp .env.example .env
# Put the key in FOODTALES_API_KEY in .env
npm run dev
```

Client:
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Open http://localhost:5173

## 3. Deploy
### Backend on Render
- Create a new **Web Service** from the `server` folder/repository.
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables:
  - `FOODTALES_API_KEY` = your private API key
  - `CLIENT_ORIGIN` = your deployed frontend URL (or comma-separated allowed origins)
  - `NODE_VERSION` = `20`
- Copy the Render backend URL.

### Frontend on Render
- Create a **Static Site** from the `client` folder/repository.
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Add environment variable:
  - `VITE_API_URL` = backend URL, e.g. `https://your-api.onrender.com`
- After deploying frontend, update backend `CLIENT_ORIGIN` with the frontend URL.

## Important notes
- This is a ready-to-configure starter, not a deployed live website.
- A Food Tales API key is required for live recipe data. Free plan quotas and data coverage are controlled by the provider.
- The upstream API's recipe detail response may differ by recipe; the modal handles common response shapes and clearly reports when full cooking instructions are not returned.
- The provider describes a large global dish index, but no API can guarantee a literal recipe for every dish/country.
