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
        },

        environment: {
          temperatureC: 0,
          humidityPct: 0,
        },

        dhtOk: false,

        lastUpdated: null,
      },

      relays: {
        items: [],

        masterLock: false,
        digitalSwitch: false,

        lastUpdated: null,
      },

      meta: {
        initialized: false,

        hasStatus: false,
        hasSensors: false,
        hasRelays: false,

        lastStatusUpdate: null,
        lastSensorsUpdate: null,
        lastRelaysUpdate: null,

        lastAnyUpdate: null,
      },
    };
  }

  updateStatus(payload) {
    const now = new Date();

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

      lastUpdated: now,
    };

    this.state.meta.hasStatus = true;
    this.state.meta.lastStatusUpdate = now;
    this.state.meta.lastAnyUpdate = now;

    this.updateInitialization();

    this.emit("statusUpdated", this.state.status);

    console.log(                                    // TESTING PURPOSES ONLY
    "[DeviceStateManager] Current State:",
    JSON.stringify(this.state.status, null, 2));

  }

  updateSensors(payload) {
    const now = new Date();

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
      },

      environment: {
        temperatureC:
          payload.temperature_c ??
          this.state.sensors.environment.temperatureC,

        humidityPct:
          payload.humidity_pct ??
          this.state.sensors.environment.humidityPct,
      },

      dhtOk:
        payload.dht_ok ??
        this.state.sensors.dhtOk,

      lastUpdated: now,
    };

    this.state.meta.hasSensors = true;
    this.state.meta.lastSensorsUpdate = now;
    this.state.meta.lastAnyUpdate = now;

    this.updateInitialization();

    this.emit("sensorsUpdated", this.state.sensors);
  }

  updateRelays(payload) {
    const now = new Date();

    if (
      !Array.isArray(payload.states) ||
      !Array.isArray(payload.locks) ||
      !Array.isArray(payload.runtime)
    ) {
      return;
    }

    if (
      payload.states.length !== 7 ||
      payload.locks.length !== 7 ||
      payload.runtime.length !== 7
    ) {
      return;
    }

    const items = payload.states.map((state, index) => ({
      relay: index + 1,
      state,
      locked: payload.locks[index],
      runtime: payload.runtime[index],
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

  updateInitialization() {
    this.state.meta.initialized =
      this.state.meta.hasStatus &&
      this.state.meta.hasSensors &&
      this.state.meta.hasRelays;
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

  isInitialized() {
    return this.state.meta.initialized;
  }

  isOnline(timeoutMs = 60000) {
    const last = this.state.meta.lastAnyUpdate;

    if (!last) return false;

    return Date.now() - last.getTime() < timeoutMs;
  }

  getLastUpdated() {
    return this.state.meta.lastAnyUpdate;
  }
}

module.exports = new DeviceStateManager();