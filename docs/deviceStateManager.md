# DeviceStateManager

## Purpose

`DeviceStateManager` is the central in-memory state store for SmartNest.

It maintains the latest device state received from MQTT live topics and provides a single source of truth for:

* REST APIs
* Socket.IO updates
* Device status monitoring
* Frontend state synchronization

The manager does **not** persist data to MongoDB.

Current state is always sourced from MQTT live messages.

---

# Architecture

```text
ESP32 Devices
      ↓
MQTT Broker
      ↓
Backend
      ↓
DeviceStateManager
      ↓
REST APIs / Socket.IO
      ↓
Mobile App
```

---

# Responsibilities

## Stores Latest State

Maintains latest values from:

* `live/status`
* `live/sensors`
* `live/relays`

## Tracks Initialization

Determines whether all required MQTT topics have been received.

## Tracks Update Times

Stores timestamps for:

* Last status update
* Last sensor update
* Last relay update
* Last overall update

## Emits Events

Notifies other services when state changes.

Events:

```js
statusUpdated
sensorsUpdated
relaysUpdated
```

---

# State Structure

```js
{
  status: {},
  sensors: {},
  relays: {},
  meta: {}
}
```

---

# Status Section

Represents device health, connectivity, and storage information.

Source MQTT Topic:

```text
<base>/live/status
```

Structure:

```js
status: {
  uptime: Number,

  wifi: {
    ssid: String | null,
    rssi: Number | null
  },

  mqttStatus: Number,

  sd: {
    ok: Boolean,
    total: Number,
    used: Number
  },

  digitalOnline: Boolean,
  pzemOnline: Boolean,
  pzemHealth: Boolean,

  dhtOk: Boolean,

  lastUpdated: Date
}
```

---

# Sensors Section

Represents live telemetry and energy readings.

Source MQTT Topic:

```text
<base>/live/sensors
```

Structure:

```js
sensors: {
  voltage: Number,

  current: {
    main: Number,
    digital: Number,
    ac: Number
  },

  power: {
    ac: Number
  },

  energy: {
    acKwh: Number,
    mainKwh: Number,
    digitalKwh: Number
  },

  environment: {
    temperatureC: Number,
    humidityPct: Number
  },

  dhtOk: Boolean,

  lastUpdated: Date
}
```

---

# Relays Section

Represents current relay states.

Source MQTT Topic:

```text
<base>/live/relays
```

Structure:

```js
relays: {
  items: [
    {
      relay: Number,
      state: Boolean,
      locked: Boolean,
      runtime: Number
    }
  ],

  masterLock: Boolean,

  digitalSwitch: Boolean,

  lastUpdated: Date
}
```

---

# Relay Object

Example:

```js
{
  relay: 1,
  state: true,
  locked: false,
  runtime: 120
}
```

---

# Meta Section

Internal state tracking.

Structure:

```js
meta: {
  initialized: Boolean,

  hasStatus: Boolean,
  hasSensors: Boolean,
  hasRelays: Boolean,

  lastStatusUpdate: Date,
  lastSensorsUpdate: Date,
  lastRelaysUpdate: Date,

  lastAnyUpdate: Date
}
```

---

## initialized

Becomes true only when:

```js
hasStatus &&
hasSensors &&
hasRelays
```

This indicates the state manager has received a complete device snapshot.

---

## hasStatus

Status topic received.

---

## hasSensors

Sensor topic received.

---

## hasRelays

Relay topic received.

---

## lastStatusUpdate

Latest status timestamp.

---

## lastSensorsUpdate

Latest sensors timestamp.

---

## lastRelaysUpdate

Latest relays timestamp.

---

## lastAnyUpdate

Most recent update from any topic.

---

# Public Methods

## updateStatus(payload)

Updates status state from MQTT status payload.

---

## updateSensors(payload)

Updates sensor state from MQTT sensor payload.

---

## updateRelays(payload)

Updates relay state from MQTT relay payload.

---

## getState()

Returns internal state object.

---

## getSnapshot()

Returns deep-cloned state snapshot.

Recommended for APIs and Socket.IO.

---

## getStatus()

Returns status section only.

---

## getSensors()

Returns sensors section only.

---

## getRelays()

Returns relays section only.

---

## getRelay(relayNumber)

Returns specific relay information.

Example:

```js
getRelay(3)
```

---

## isInitialized()

Returns initialization status.

---

## isOnline(timeoutMs)

Checks whether device is considered online.

Default timeout:

```js
60000
```

Returns:

```js
true
```

if updates were received recently.

---

## getLastUpdated()

Returns latest update timestamp.

---

# Important Notes

* DeviceStateManager is memory-only.
* MongoDB is not used for current state.
* MQTT live topics are the source of truth.
* Historical storage is handled separately.
* Command tracking is handled separately.
* History synchronization is handled separately.
* State is lost on backend restart and rebuilt automatically from MQTT live messages.

```
```
