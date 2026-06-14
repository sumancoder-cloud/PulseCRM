# PulseCRM Backend

Express + JavaScript + Mongoose API for the Xeno SDE Internship assignment.

## Setup

1. Configure MongoDB URI in `.env` (Atlas connection string or local MongoDB instance).
2. Install packages and seed database:
```bash
npm install
npm run setup # runs seeder script to populate MongoDB
npm run dev
```

Runs on **http://localhost:5000**

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Dev server with watch mode |
| `npm run start` | Start server |
| `npm run setup` | Run seeder to seed data |
| `npm run seed` | Re-seed Arora Roast shoppers |

## Environment

See `.env.example`
