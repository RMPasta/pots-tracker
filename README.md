# POTS Companion

Symptom and trigger tracking for people with POTS and dysautonomia. Log daily or log incidents; export for your doctor; gentle AI insights.

## Setup

Copy `.env.example` to `.env` and fill in your values. Then:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

---

**Note on naming:** This app was rebranded from "POTS Tracker" to "POTS Companion." The codebase and product name have been updated. The only identifiers that could not be changed are the **Google Cloud project ID** (the project display name was updated, but the project ID is immutable) and the **Vercel/database name**—so the database connection string may still contain "tracker" (e.g. in the database or host name). This is expected and does not affect functionality.
