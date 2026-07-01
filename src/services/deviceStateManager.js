const EventEmitter = require("events");

class DeviceStateManager extends EventEmitter {
  constructor() {
    super();

    this.reset();
  }

  reset() {
    this.state = {
      status: {
        uptime: 0,

        wifi: {
          ssid: null,
          rssi: null,
        },

        mqttStatus: 0,

        sd: {
          ok: false,
          total: 0,
          used: 0,
        },

        digitalOnline: false,
        pzemOnline: false,
        pzemHealth: false,
        dhtOk: false,

        voltageEstimated: false,
        timeSource: null,
        resetReason: null,

        lastUpdated: null,
      },

      sensors: {
        voltage: 0,

        current: {
          main: 0,
          digital: 0,
          ac: 0,
        },

        power: {
          ac: 0,
        },

        energy: {
          acKwh: 0,
          mainKwh: 0,
          digitalKwh: 0,
          pzemCumulativeKwh: 0,
          acDayStartKwh: 0,
        },

        environment: {
          temperatureC: 0,
          humidityPct: 0,
        },

        lastUpdated: null,
      },

      relays: {
        items: [],

        masterLock: false,
        digitalSwitch: false,

        lastUpdated: null,
      },

      slaves: {
        digitalBoard: {
          online: false,
          rssi: null,
          lastSeenSecAgo: null,
        },

        pzem: {
          online: false,
          rssi: null,
          lastSeenSecAgo: null,
        },

        lastUpdated: null,
      },

      meta: {
        initialized: false,

        hasStatus: false,
        hasSensors: false,
        hasRelays: false,
        hasSlaves: false,

        lastStatusUpdate: null,
        lastSensorsUpdate: null,
        lastRelaysUpdate: null,
        lastSlavesUpdate: null,

        lastAnyUpdate: null,
      },
    };
  }

  updateStatus(payload) {
    const now = new Date().toISOString();

    this.state.status = {
      ...this.state.status,

      uptime: payload.uptime ?? this.state.status.uptime,

      wifi: {
        ssid: payload.ssid ?? this.state.status.wifi.ssid,
        rssi: payload.rssi ?? this.state.status.wifi.rssi,
      },

      mqttStatus:
        payload.mqtt_status ?? this.state.status.mqttStatus,

      sd: {
        ok: payload.sd_ok ?? this.state.status.sd.ok,
        total: payload.sd_total ?? this.state.status.sd.total,
        used: payload.sd_used ?? this.state.status.sd.used,
      },

      digitalOnline:
        payload.digital_online ??
        this.state.status.digitalOnline,

      pzemOnline:
        payload.pzem_online ??
        this.state.status.pzemOnline,

      pzemHealth:
        payload.pzem_health ??
        this.state.status.pzemHealth,

      dhtOk:
        payload.dht_ok ??
        this.state.status.dhtOk,

      voltageEstimated:
        payload.voltage_estimated ??
        this.state.status.voltageEstimated,

      timeSource:
        payload.time_source ??
        this.state.status.timeSource,

      resetReason:
        payload.reset_reason ??
        this.state.status.resetReason,

      lastUpdated: now,
    };

    this.state.meta.hasStatus = true;
    this.state.meta.lastStatusUpdate = now;
    this.state.meta.lastAnyUpdate = now;

    this.updateInitialization();

    this.emit("statusUpdated", this.state.status);

    // console.log(                                    // TESTING PURPOSES ONLY
    // "[DeviceStateManager] Current State:",
    // JSON.stringify(this.state.status, null, 2));

  }

  updateSensors(payload) {
    const now = new Date().toISOString();

    this.state.sensors = {
      ...this.state.sensors,

      voltage:
        payload.voltage ??
        this.state.sensors.voltage,

      current: {
        main:
          payload.main_current ??
          this.state.sensors.current.main,

        digital:
          payload.digital_current ??
          this.state.sensors.current.digital,

        ac:
          payload.ac_current ??
          this.state.sensors.current.ac,
      },

      power: {
        ac:
          payload.ac_power ??
          this.state.sensors.power.ac,
      },

      energy: {
        acKwh:
          payload.ac_energy_kwh ??
          this.state.sensors.energy.acKwh,

        mainKwh:
          payload.main_energy_kwh ??
          this.state.sensors.energy.mainKwh,

        digitalKwh:
          payload.digital_energy_kwh ??
          this.state.sensors.energy.digitalKwh,

        pzemCumulativeKwh:
          payload.pzem_cumulative_energy_kwh ??
          this.state.sensors.energy.pzemCumulativeKwh,

        acDayStartKwh:
          payload.ac_day_start_kwh ??
          this.state.sensors.energy.acDayStartKwh,
      },

      environment: {
        temperatureC:
          payload.temperature_c ??
          this.state.sensors.environment.temperatureC,

        humidityPct:
          payload.humidity_pct ??
          this.state.sensors.environment.humidityPct,
      },

      lastUpdated: now,
    };

    this.state.meta.hasSensors = true;
    this.state.meta.lastSensorsUpdate = now;
    this.state.meta.lastAnyUpdate = now;

    this.updateInitialization();

    this.emit("sensorsUpdated", this.state.sensors);
  }

  updateRelays(payload) {
    const now = new Date().toISOString();

    if (
      !Array.isArray(payload.states) ||
      !Array.isArray(payload.locks) ||
      !Array.isArray(payload.runtime_sec)
    ) {
      return;
    }

    if (
      payload.states.length !== 7 ||
      payload.locks.length !== 7 ||
      payload.runtime_sec.length !== 7
    ) {
      return;
    }

    const items = payload.states.map((state, index) => ({
      relay: index + 1,
      state,
      locked: payload.locks[index],
      runtimeSec: payload.runtime_sec[index],
    }));

    this.state.relays = {
      items,

      masterLock:
        payload.master_lock ??
        this.state.relays.masterLock,

      digitalSwitch:
        payload.digital_switch ??
        this.state.relays.digitalSwitch,

      lastUpdated: now,
    };

    this.state.meta.hasRelays = true;
    this.state.meta.lastRelaysUpdate = now;
    this.state.meta.lastAnyUpdate = now;

    this.updateInitialization();

    this.emit("relaysUpdated", this.state.relays);
  }

  updateSlaves(payload) {
    const now = new Date().toISOString();

    this.state.slaves = {

      digitalBoard: {
        online: payload.digital_board.online,
        rssi: payload.digital_board.rssi,
        lastSeenSecAgo: payload.digital_board.last_seen_sec_ago,
      },

      pzem: {
        online: payload.pzem.online,
        rssi: payload.pzem.rssi,
        lastSeenSecAgo: payload.pzem.last_seen_sec_ago,
      },

      lastUpdated: now,
    };

    this.state.meta.hasSlaves = true;
    this.state.meta.lastSlavesUpdate = now;
    this.state.meta.lastAnyUpdate = now;

    this.emit("slavesUpdated", this.state.slaves);
  }

  updateInitialization() {
    this.state.meta.initialized =
      this.state.meta.hasStatus &&
      this.state.meta.hasSensors &&
      this.state.meta.hasRelays &&
      this.state.meta.hasSlaves;
  }

  getState() {
    return this.state;
  }

  getSnapshot() {
    return structuredClone(this.state);
  }

  getStatus() {
    return this.state.status;
  }

  getSensors() {
    return this.state.sensors;
  }

  getRelays() {
    return this.state.relays;
  }

  getRelay(relayNumber) {
    return this.state.relays.items.find(
      (relay) => relay.relay === relayNumber
    );
  }

  getSlaves() {
    return this.state.slaves;
  }

  isInitialized() {
    return this.state.meta.initialized;
  }

  isOnline(timeoutMs = 60000) {
    const last = this.state.meta.lastAnyUpdate;

    if (!last) return false;

    return Date.now() - new Date(last).getTime() < timeoutMs;
  }

  getLastUpdated() {
    return this.state.meta.lastAnyUpdate;
  }
}

module.exports = new DeviceStateManager();