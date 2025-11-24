# LoopCast (IPTV-Style Ad Playback & Scheduling System)

**LoopCast** is an IPTV-style advertisement playback ecosystem with device registration (via QR), schedule-based ad delivery, filler ads, dashboards, and multiple player clients (Web, Roku, etc.).  
This README documents the current API structure, frontend usage, and system behavior.

---

## Table of Contents
- [System Overview](#system-overview)
- [Architecture](#architecture)
- [Database Structure](#database-structure)
- [API Endpoints](#api-endpoints)
- [Frontend API Functions](#frontend-api-functions)
- [Playback Logic](#playback-logic)
- [Registration Flow](#registration-flow)
- [Example Workflow](#example-workflow)
- [Roadmap](#roadmap)
- [Summary](#summary)

---

## System Overview

LoopCast includes:

### 🖥 Dashboard (React)
- Manage ads  
- Manage devices  
- Confirm device registrations  
- Create/edit/delete schedules  

### ⚙️ Backend (Rust, Axum)
- Ad management  
- Device registration  
- Schedule logic  
- Player playlist generation  

### 📺 Player Clients
- Browser-based player (React)  
- Roku player (SceneGraph) in v2   

---

## Architecture

Player Device ←→ Backend (Axum) ←→ Dashboard (React)


The backend exposes three main API groups:

- `/api/player` – device registration, confirmation, status, playlist logic  
- `/api/schedule` – all schedule CRUD operations  
- `/api/ad` – ad listing  

---

## Database Structure

### Enum Types
#### `status_type`
Represents the lifecycle state of a player or schedule:

- `pending`
- `active`
- `inactive`

---

### Tables

#### **ads**
Stores all uploaded ads (videos or images).

| Column      | Type      | Details |
|-------------|-----------|---------|
| `id`        | UUID (PK) | Unique ad identifier |
| `name`      | TEXT      | Display name of the ad |
| `file_name` | TEXT      | File name stored on server |
| `duration`  | INTEGER   | Duration in seconds (used for images) |
| `ad_type`   | TEXT      | `video` or `image` |

---

#### **players**
Represents playback devices registered via QR code.

| Column               | Type            | Details |
|----------------------|-----------------|---------|
| `id`                 | UUID (PK)       | Device identifier |
| `name`               | TEXT            | Optional device name |
| `address`            | TEXT            | Optional address |
| `zip_code`           | TEXT            | Optional address |
| `city`               | TEXT            | Optional address |
| `state`              | TEXT            | Optional address |
| `country`            | TEXT            | Optional address |
| `notes`              | TEXT            | Admin notes for the device |
| `registration_token` | TEXT            | Token used for QR onboarding |
| `status`             | status_type     | Default `pending` |
| `registered_at`      | TIMESTAMPTZ     | Auto-set on insert |

**Notes:**
- Devices start as **pending** and are activated when the dashboard confirms them.
- `registration_token` links the player device to the backend.

---

#### **ad_schedules**
Defines which ads play on which players and when.

| Column           | Type            | Details |
|------------------|-----------------|---------|
| `id`             | UUID (PK)       | Schedule entry ID |
| `ad_id`          | UUID (FK)       | References `ads(id)` |
| `player_id`      | UUID (FK)       | References `players(id)` |
| `start_time`     | TIMESTAMP       | When the ad becomes active |
| `end_time`       | TIMESTAMP       | When the ad expires |
| `is_filler`      | BOOLEAN         | If true → played when no schedules match |
| `ad_order`       | INTEGER         | Order within the playlist |
| `status`         | status_type     | Default `active` |
| `repeat_interval`| INTERVAL        | Optional repeating schedule |

**Behavior:**
- Scheduled ads play when current time is between `start_time` and `end_time`.
- If no scheduled ads match, the system falls back to ads where `is_filler = true`.


---

## API Endpoints

### **Player / Device**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/player/register/:token` | Register a device and return QR SVG |
| `GET` | `/api/player/info/:deviceName` | Check device status & registration state |
| `POST` | `/api/player/confirm-registration/:token` | Dashboard confirms registration |
| `GET` | `/api/player/list` | List all players |
| `GET` | `/api/player/:id` | Get player details |

---

### **Schedule**
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/schedule/:deviceId` | Fetch full playlist for a device |
| `POST` | `/api/schedule/create` | Create schedule entry |
| `PUT` | `/api/schedule/update/:id` | Update schedule entry |
| `DELETE` | `/api/schedule/delete/:id` | Delete schedule entry |

---

### **Ads**
| Method | Endpoint           | Description        |
|--------|---------------------|--------------------|
| `GET`  | `/api/ad/all`      | Retrieve all ads   |
| `POST` | `/api/ad/upload`   | Upload a new ad    |

The upload endpoint supports both single-file and chunked uploads. Chunked uploads are stored temporarily and automatically assembled, after which metadata is extracted and the ad is saved.

---

## Frontend API Functions

These match the current React code:

```js
// Device registration
registerPlayer(token)
getPlayerStatus(deviceName)
confirmDevice(token)

// Player management
fetchPlayers()
fetchPlayerDetails(playerId)

// Schedules
fetchSchedule(deviceId)
createScheduleEntry(payload)
updateScheduleEntry(scheduleId, payload)
deleteScheduleEntry(scheduleId)

// Ads
fetchAds()
uploadAdFile(file)
```

## Playback Logic

1. **Player starts**  
   The device requests the playlist from:

    `GET /api/schedule/:deviceId`
    

2. **Backend determines the correct ads**  
- Gets current UTC time  
- Retrieves scheduled ads where the time window matches  
- If no schedule matches → returns **filler ads** (`is_filler = true`)  

3. **Player loops ads**  
- Videos are played using `<video>`  
- Images are shown for their `duration` value  
- After finishing the list, it loops again  
- The player periodically refreshes the playlist (every 5–10 minutes)

4. **If the device is not registered**  
- The player shows a QR code from the `/register/:token` endpoint  
- Admin scans the QR using the dashboard  
- Dashboard completes the process using:

  ```
  POST /api/player/confirm-registration/:token
  ```

---

## Registration Flow
### **Player Status & Registration**

- The player component checks `localStorage` every 10 seconds for stored player data.
- If no active player is found, it shows the **registration** form (`PlayerRegistration`) and a **login** option (`PlayerLogin`).
- Once a player is confirmed as `active`, the component stops polling and renders the full-screen player (`FullscreenPlayer`).
- Users can restart registration by clearing stored data and reloading the page.


## Roadmap

### Backend Improvements
- Impression tracking (`/api/player/report`)  
- JWT authentication for dashboard login
- Device heartbeat (online/offline tracking)
- Tag-based schedule routing (group devices)  

### Dashboard Enhancements
- Calendar / timeline scheduling UI 
- Drag-and-drop ad ordering  
- Bulk device assignment   

### Player Upgrades
- Offline caching of filler ads 
- Auto-update player bundle  
- Improved network fallback behavior  
- Support for additional codecs (H.265, VP9)  

---

## Summary

LoopCast delivers:

- QR-based device onboarding  
- Playlist logic with scheduled + filler ads  
- Multi-device management  
- Web dashboard for admins  
- Player applications for Web and Roku (to come) 