# LoopCast (IPTV-Style Ad Playback System)

**LoopCast** is a full-featured IPTV-style ad playback system, designed to schedule and play video and image ads across multiple devices, with support for filler content, QR-based device registration, and time-based scheduling.

---

## Table of Contents
- [System Overview](#system-overview)
- [Database Structure](#database-structure)
- [API Endpoints](#api-endpoints)
- [Playback Logic](#playback-logic)
- [Example Workflow](#example-workflow)
- [Web Player Sample Logic](#web-player-sample-logic)
- [Roadmap / Next Steps](#roadmap--next-steps)
- [Summary](#summary)

---

## System Overview

- **Goal:** Build a full IPTV-style ad playback ecosystem with smart scheduling, filler content, and device registration.
- **Core Components:**
  - 🖥 **Dashboard (Web UI):** Upload/manage ads, create schedules, assign devices.
  - ⚙️ **Rust Backend (Axum + SQLx):** Manages ads, devices, schedules, QR registration, and playback API.
  - 📺 **Players (Web & Roku):** Fetch playlists and play ads (video or images) according to schedule.

---

## Database Structure

**`ads`**  
- `id`, `name`, `url`, `duration`  
- `ad_type` (`video` or `image`)

**`devices`**  
- `id`, `name`, `tags`  
- `registered_at` (timestamp)  
- Each device has a **unique UUID** and can be linked via **QR code scan**  

**`ad_schedules`**  
- `id`, `ad_id`, `device_id`  
- `start_time`, `end_time` (time window for scheduled ads)  
- `is_filler` (0 = scheduled, 1 = filler)  
- `ad_order`  

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check (returns `"OK"`) |
| `/player/register` | GET | Register a new player and generate a registration token + QR code |
| `/player/confirm-registration/:registration_token` | POST | Confirm player registration with registration token and payload (name, address, etc.) |
| `/api/ads` | POST | Upload an ad (video/image) |
| `/api/ads` | GET | List all ads |
| `/api/devices` | POST | Register a new playback device |
| `/api/devices/:id/qrcode` | GET | Generate QR code for device registration |
| `/api/ad_schedules` | POST | Assign ads to devices with time windows or filler role |
| `/api/player/:device_id` | GET | Fetch playlist for a device (scheduled + fallback filler ads) |
| `/api/player/report` | POST | Track ad impressions (analytics) |

---

## Playback Logic

1. **Device Startup**
   - Device has a **unique ID**  
   - Admin scans QR code to link device to dashboard

2. **Backend (`/api/player/:device_id`)**
   - Checks current UTC time (`HH:MM`)  
   - Fetches **scheduled ads** for this time window (`is_filler = 0`)  
   - If none → returns **filler ads** (`is_filler = 1`)  
   - Supports both **video** and **image** ads

3. **Player**
   - Loops playlist sequentially  
   - `video` → `<video>` element (or Roku Video node)  
   - `image` → display for `duration` seconds  
   - Refetch playlist every `refresh_after` seconds (e.g., 300–600 s)

---

## Example Workflow

| Time | Playlist Returned |
|------|------------------|
| 08:00–10:00 | 10 scheduled video/image ads |
| Other times | Filler ads (looped image or video content) |

---

## Roadmap / Next Steps

### Backend
- [ ] Add `ad_type` column (`video`, `image`, `html`)  
- [ ] QR code generator (`GET /api/devices/:id/qrcode`) using `qrcode` crate  
- [ ] `/api/player/report` endpoint for impression tracking  
- [ ] JWT-based authentication for dashboard API  

### Dashboard (React/TypeScript)
- [ ] Device list view with QR code scan registration  
- [ ] Schedule builder UI (drag & drop ads into time slots)  
- [ ] Upload form with auto-detect for video/image type  
- [ ] Calendar/timeline view for ad schedules  

### Player (Web & Roku)
- [ ] Web player: HTML5 `<video>` + `<img>` support  
- [ ] Roku app: SceneGraph nodes for video/images  
- [ ] Auto-refresh playlist every 5–10 minutes  
- [ ] Display “Device not assigned” QR screen until linked  

### Future Expansion
- [ ] Campaign grouping (multiple devices share schedule)  
- [ ] Priority weights / frequency control  
- [ ] Geo-targeting per device  
- [ ] Offline caching for unreliable connections  
- [ ] Real-time dashboard showing which ad is currently playing  


