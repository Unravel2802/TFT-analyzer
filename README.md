# TierMind — TFT Analyzer

Look up any Teamfight Tactics player and see their rank, recent placements, average
finish, most-played units and traits, and full 8-player match boards with champion
icons, star levels, items, and traits.

**Stack:** FastAPI + Supabase (Postgres) · React + TypeScript (Vite) · Riot Games API.

---

## Quick start

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp ".env .example" .env        # then fill in the values below
uvicorn app.main:app --reload  # serves http://localhost:8000
```

Required environment variables (`backend/.env`):

| Variable | Purpose |
|----------|---------|
| `riot_api_key` | Riot API key from developer.riotgames.com |
| `supabase_url` | Supabase project URL |
| `supabase_key` | Supabase API key |
| `database_url` | Postgres connection string |
| `secret_key` | Random string used to sign JWTs |
| `allowed_origins` | JSON list of CORS origins, e.g. `["http://localhost:5173"]` |

Supabase tables required: `users`, `riot_accounts`, `tft_matches`.

### Frontend
```bash
cd frontend
npm install
npm run dev   # serves http://localhost:5173
```

### Tests
```bash
cd backend && pytest
```

---

## Project structure

Code is organized by layer (backend) and by feature (frontend). For a folder-by-folder
breakdown and the rules to follow when adding code, see **[ARCHITECTURE.md](./ARCHITECTURE.md)**.
