const EventEmitter = require("events");

class CommandStateManager extends EventEmitter {
  constructor() {
    super();

    this.reset();
  }

  reset() {
    this.state = {
      pending: new Map(),
    };
  }

  create(command) {
    this.state.pending.set(command.cmdId, command);

    this.emit("commandCreated", command);

    return command;
  }

  complete(cmdId, ack) {
    const command = this.state.pending.get(cmdId);

    if (!command) return null;

    // Stop the timeout because an ACK has been received
    clearTimeout(command.timeoutId);

    this.state.pending.delete(cmdId);

    const result = {
      ...command,
      ack,
      completedAt: new Date(),
    };

    this.emit("commandCompleted", result);

    return result;
  }

  fail(cmdId, ack) {
    const command = this.state.pending.get(cmdId);

    if (!command) return null;

    clearTimeout(command.timeoutId);

    this.state.pending.delete(cmdId);

    const result = {
      ...command,
      ack,
      failedAt: new Date(),
    };

    this.emit("commandFailed", result);

    return result;
  }

  timeout(cmdId) {
    const command = this.state.pending.get(cmdId);

    if (!command) return null;

    this.state.pending.delete(cmdId);

    console.warn(`[CommandStateManager] Command timed out: ${cmdId}`);

    const result = {
      ...command,
      timedOutAt: new Date(),
    };

    this.emit("commandTimedOut", result);

    return result;
  }

  /**
   * Processes a command ACK received from the device.
   *
   * @param {object} ack - MQTT ACK payload
   */
  handleAck(ack) {

    const pendingCommand = this.get(ack.cmd_id);

    if (!pendingCommand) {
      console.warn(
        `[CommandStateManager] Unknown command ACK: ${ack.cmd_id}`
      );
      return;
    }

    if (ack.ok) {
      console.log(
        `[CommandStateManager] Command completed: ${ack.cmd_id}`
      );

      this.complete(ack.cmd_id, ack);
    } else {
      console.warn(
        `[CommandStateManager] Command failed: ${ack.cmd_id} (${ack.reason})`
      );

      this.fail(ack.cmd_id, ack);
    }
  }

  get(cmdId) {
    return this.state.pending.get(cmdId);
  }

  remove(cmdId) {
    return this.state.pending.delete(cmdId);
  }

  has(cmdId) {
    return this.state.pending.has(cmdId);
  }

  getPendingCount() {
    return this.state.pending.size;
  }

  getPendingCommands() {
    return [...this.state.pending.values()];
  }
}

module.exports = new CommandStateManager();