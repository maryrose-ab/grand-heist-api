# Grand Heist API

Backend API for Grand Heist a tournament game for the SorSU Bulan Campus library.
CS 313 Software Engineering 1, A.Y. 2026-2027.

- Developer: Mary Rose A. Bellezo maryrose-ab, BSCS 3-2
- Group and game concept: Group 8 

This is my own build of my group's game concept. Every commit in this repository was made by me, with Git, on my own computer or in my own Codespace.

## Tech stack

| Layer | Tool |
|---|---|
| Runtime | Node.js 22 LTS or newer |
| Web framework | Express 5 |
| Database | PostgreSQL 16 or newer |
| ORM and migrations | Sequelize 6 with sequelize-cli |

## Setup

```
git clone https://github.com/maryrose-ab/grand-heist-api.git
cd %USERPROFILE%\Documents
cd grand-heist-api
npm install
```

Copy `.env.example` to `.env`, then put your own PostgreSQL password in `DB_PASSWORD`.

```
npm run db:create     (first time only)
npm run db:migrate
npm run db:seed
npm run db:check
npm run dev
```

## Environment variables

| Key | Example | Purpose |
|---|---|---|
| NODE_ENV | development | Which config block to use |
| PORT | 3001 | Port the API listens on (the library assigns the final port at deployment) |
| DB_HOST | 127.0.0.1 | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_NAME | your_game_slug | Database name: your game slug, with underscores |
| DB_USER | postgres | Database user |
| DB_PASSWORD | (your own) | Database password. Never commit this. |
| HUB_API_KEY | dev-hub-key | Key the Library Game Hub sends to read results. The library gives the real one at deployment. |

## Endpoints (Hub Contract v1.2)

Base URL: `http://localhost:3001/api/v1`

| Method | Path | Purpose | Success |
|---|---|---|---|
| GET | /health | Is the API up and can it reach the database? | 200 (503 when the database is down) |
| GET | /game-info | Slug, name, group, developer, description, player limits, version | 200 |
| GET | /results | Finished games, every player, and the top 3. Needs the `X-Hub-Key` header. Optional `?since=` | 200 (401 without the key) |

## What "completed" means in my game

A player is completed when they have answered every question
in the game's question set. A game appears in /results once its status is `ended`
and at least one player joined it.

## Tables

In the order of the migrations:

| Table | Holds |
|---|---|
| users | Accounts. Hosts and players share it; `role` tells them apart |
| vault_tiers | Vault tiers |
| question_sets | A host's question set (title) |
| questions | Questions in a set |
| question_choices | Answer choices of a question |
| sessions | Games, with a six-digit join code and a status |
| players | One seat per account per game (UNIQUE `uq_one_seat`) |
| answers | Answers given by players |
| reward_offers | Reward offers |
| equipment | Equipment items |
| reward_offer_options | Options inside a reward offer |
| beneficial_items | Equipment subtype |
| defense_items | Equipment subtype |
| buff_items | Equipment subtype |
| sabotage_items | Equipment subtype |
| special_items | Equipment subtype |
| inventory_items | Items a player holds |
| status_effects | Effects active on a player |
| shop_listings | Items for sale |

## Database scripts

| Command | What it does |
|---|---|
| npm run db:migrate | Runs migrations that have not run yet |
| npm run db:migrate:status | Lists every migration as up or down |
| npm run db:seed | Loads the seed data |
| npm run db:check | Counts the rows in every table |
| npm run db:reset | Empties the database, rebuilds every table and reloads the seed data |
| npm run check | Runs the same automatic check that GitHub runs after every push |

## Sessions (Week 11)

| Method | URL | Who may call | Success |
|---|---|---|---|
| POST | /api/v1/sessions | host, admin (owner of the set) | 201 |
| GET | /api/v1/sessions/{code} | anyone | 200 |
| PATCH | /api/v1/sessions/{code} | host, admin (owner of the set) | 200 |

Status flow: waiting -> playing -> ended. An ended game cannot change.
Headers: X-Demo-User (temporary, until Week 12).

## Players (Week 11)

| Method | URL | Who may call | Success |
|---|---|---|---|
| POST | /api/v1/sessions/{code}/players | any logged-in user | 201 new seat / 200 rejoin |
| GET | /api/v1/sessions/{code}/players | anyone | 200 |

Joining checks, in order: session exists, rejoin (same seat), one running game at a time,
lobby only, room left (fixed limit of 50), nickname free (database constraint).


## Question sets (Week 11)

Every endpoint is for hosts. A host sees and changes only their own sets.
The owner is always the caller; a client cannot choose it.

| Method | URL | Who may call | Success | Can fail with |
|---|---|---|---|---|
| GET | /api/v1/question-sets | host | 200, an array | 401, 403 |
| POST | /api/v1/question-sets | host | 201 | 400, 401, 403 |
| GET | /api/v1/question-sets/{id} | host (owner) | 200 | 400, 401, 403, 404 |
| PATCH | /api/v1/question-sets/{id} | host (owner) | 200 | 400, 401, 403, 404 |
| DELETE | /api/v1/question-sets/{id} | host (owner) | 204 | 400, 401, 403, 404, 409 |

Title: 3 to 80 characters. A set used in a game cannot be deleted (409 `QUESTION_SET_IN_USE`).

## Headers

| Header | Who sends it | Purpose |
|---|---|---|
| X-Demo-User | players and hosts (temporary, until Week 12) | School ID of the caller |
| X-Hub-Key | the Library Hub | Allows reading `/results` |

## Testing

`npm run db:reset`, import `postman/<your file>.json`, then Run collection. Then `npm run check`.