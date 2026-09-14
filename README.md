# LoopCast

IPTV-style advertisement playback and scheduling. Devices register via QR code, admins manage ads and schedules from a dashboard, and players loop video/image ads fullscreen.

## Stack

| Layer | Tech |
|-------|------|
| Backend | Rust, Axum, SQLx, PostgreSQL |
| Frontend | React 19, React Router, Bootstrap, Axios |
| Media | Chunked uploads, Range-based video streaming |

## Project layout

```
LoopCast/
├── server/          # Rust API (port 3001)
│   ├── db/          # schema + dbmate migrations
│   ├── src/         # handlers, routes, models
│   └── uploads/     # uploaded ad files
├── web_app/         # React dashboard + player (port 3000)
└── run_dev.sh       # starts backend + frontend together
```

## Quick start

### Prerequisites

- Rust (with `cargo`)
- Node.js + npm
- PostgreSQL
- [dbmate](https://github.com/amacneil/dbmate) (for migrations)
- Optional: [cargo-watch](https://github.com/watchexec/cargo-watch) for `run_dev.sh`
- `ffprobe` / FFmpeg on `PATH` (used to read media duration on upload)

### Database

1. Create a Postgres database.
2. Copy / create `server/.env`:

```env
DATABASE_URL=postgres://USER:PASSWORD@localhost:5432/loopcast
```

3. Run migrations from `server/`:

```bash
dbmate --migrations-dir db/migrations up
```

Schema lives in `server/db/schema.sql`.

### Run

**One command (dev):**

```bash
./run_dev.sh
```

Starts the Axum server (with cargo-watch) and the React app.

**Or separately:**

```bash
# Backend
cd server && cargo run
# → http://0.0.0.0:3001

# Frontend
cd web_app && npm install && npm start
# → http://localhost:3000
```

Health check: `GET http://localhost:3001/health` → `OK`

## Frontend routes

| Path | Purpose |
|------|---------|
| `/` | Player registration / login, or fullscreen player when active |
| `/register/:token` | Complete device registration (opened from QR) |
| `/dashboard` | Admin dashboard (players, schedules, ads) |

## Architecture

```
Player / Dashboard  ←→  Axum API (:3001)  ←→  PostgreSQL
                              ↓
                     uploads / video stream
```

API groups:

- `/api/player` — register, confirm, login, list, get
- `/api/schedule` — playlist + CRUD
- `/api/ad` — list, upload, delete
- `/api/video_stream` — serve media (supports HTTP Range)

## Database

### `status_type`

Enum: `pending` · `active` · `inactive`

### `ads`

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `name` | TEXT | Display name |
| `file_name` | TEXT | Stored file name |
| `duration` | INTEGER | Seconds (esp. images) |
| `ad_type` | TEXT | `video` or `image` |

### `players`

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `name` | TEXT | Optional |
| `address`, `zip_code`, `city`, `state`, `country` | TEXT | Location |
| `notes` | TEXT | Admin notes |
| `registration_token` | TEXT | QR / onboarding token |
| `status` | status_type | Default `pending` |
| `registered_at` | TIMESTAMPTZ | Default `now()` |

Devices start as `pending` and become `active` after registration is confirmed.

### `ad_schedules`

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `ad_id` | UUID FK → ads | |
| `player_id` | UUID FK → players | |
| `start_time` / `end_time` | TIMESTAMP | Window for the slot |
| `is_filler` | BOOLEAN | Fallback when nothing is scheduled |
| `ad_order` | INTEGER | Order in playlist |
| `status` | status_type | Default `active` |
| `repeat_interval` | INTERVAL | Optional repeat (e.g. 15 min, daily) |

## API

### Player

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/player/register/:token` | Create pending player for token |
| `POST` | `/api/player/confirm-registration/:token` | Activate player (JSON body: name, address, zip_code, city, state, country) |
| `POST` | `/api/player/login` | Login with `{ name, registration_token }` |
| `GET` | `/api/player/list` | List players |
| `GET` | `/api/player/:device_id` | Player details |

### Schedule

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/schedule/:player_id` | Full schedule for a device (joined with ad metadata) |
| `POST` | `/api/schedule/create` | Create entry |
| `PUT` | `/api/schedule/update/:id` | Update entry |
| `DELETE` | `/api/schedule/delete/:id` | Delete entry |

Create/update payload fields include: `ad_id`, `player_id`, `start_time` (`YYYY-MM-DDTHH:MM`), optional `ad_duration`, `is_filler`, `ad_order`, `repeat_interval` (`15min`, `30min`, `1hr`, `6hr`, `12hr`, `daily`, `weekly`, `monthly`).

### Ads

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/ad/all` | List ads |
| `POST` | `/api/ad/upload` | Multipart upload (single file or chunks) |
| `DELETE` | `/api/ad/:ad_id` | Delete ad |

Chunked upload fields: `ad_name`, `file_name`, `chunk_number`, `total_chunks`, `chunk_data`. Frontend uses ~2MB chunks. After assembly, metadata (duration, type) is extracted and the row is inserted.

### Video stream

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/video_stream/:video_name` | Stream media; supports `Range` for seeking |

## Frontend API helpers (`web_app/src/api.js`)

```js
registerPlayer(token)
getPlayerStatus(deviceName)   // calls /info — not wired on backend yet
confirmDevice(token)
fetchPlayers()
fetchPlayerDetails(playerId)
fetchSchedule(deviceId)
createScheduleEntry(payload)
updateScheduleEntry(scheduleId, payload)
deleteScheduleEntry(scheduleId)
fetchAds()
uploadAd(formData)
```

## Registration flow

1. Player opens `/` → shows a 6-character token and QR pointing at `/register/:token`.
2. Admin (or phone) opens that URL → `POST /api/player/register/:token` creates a pending row, then the form collects location/name.
3. Submit → `POST /api/player/confirm-registration/:token` sets status to `active` and stores the player in `localStorage`.
4. Existing devices can use **login** (`POST /api/player/login`) with name + token.
5. When `localStorage` has an active player, `/` renders the fullscreen player.

`PlayerStatus` polls `localStorage` every 10s until the device is active.

## Playback

1. Active player loads `GET /api/schedule/:playerId`.
2. Each item is played from `/api/video_stream/:file_name`.
3. Videos use dual `<video>` elements with a short crossfade; images show for `duration` seconds.
4. Playlist loops; click the surface to enter fullscreen.

**Note:** The schedule endpoint currently returns all rows for the player. Time-window / filler selection on the server is planned; until then the client plays the returned list in order.

## Dashboard

At `/dashboard`:

- **Player list** — select a device
- **Player details** — info for the selected player
- **Schedule management** — create / edit / delete schedule entries
- **Ads management** — list, chunked upload, preview, delete
- **Analytics** — placeholder UI

## Roadmap

- Server-side schedule filtering (active window + filler fallback)
- Impression / play reporting
- Auth for the dashboard
- Device heartbeat (online/offline)
- Tag-based device groups
- Richer calendar scheduling UI
- Offline filler caching on the player
- Additional player clients (e.g. Roku)

## Summary

LoopCast today supports QR onboarding, login, ad upload/streaming, per-device schedules, and a web dashboard + fullscreen browser player.
