# SmartNest Backend

Node.js + Express backend for the SmartNest IoT home automation system.

## Features
- Device ON/OFF control via REST API + MQTT
- Live energy monitoring (PZEM-004T)
- Temperature-based automation rules
- Scheduling (time-based ON/OFF)
- Manual switch state synchronization

## Stack
- **Runtime**: Node.js
- **Framework**: Express
- **IoT Communication**: MQTT (via `mqtt` package)
- **Database**: SQLite (`better-sqlite3`)

## Getting Started

```bash
npm install
cp .env.example .env   # fill in your values
npm run dev
```

## Project Structure

```
src/
├── config/         # DB, MQTT, env config
├── controllers/    # Route handler logic
├── routes/         # Express route definitions
├── services/       # Business logic
├── mqtt/           # MQTT client, topic map, message handlers
├── models/         # SQLite schema + queries
├── middleware/     # Error handler, validation
└── utils/          # Logger, helpers
```

## API Endpoints (planned)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/devices | List all devices |
| POST | /api/devices/:id/command | Send ON/OFF command |
| GET | /api/energy/:deviceId | Get energy readings |
| GET | /api/schedules | List schedules |
| POST | /api/schedules | Create schedule |
| GET | /api/automation/rules | List automation rules |
| POST | /api/automation/rules | Create automation rule |
