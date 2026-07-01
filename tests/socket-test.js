const { io } = require("socket.io-client");

// Paste your JWT here
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2YTQxNTBlMjM5YTYyYjBmNDcyNTFiMTgiLCJ1c2VybmFtZSI6Im9tamlkdWJleSIsImlhdCI6MTc4Mjg4NzI3MSwiZXhwIjoxNzgyODg4MTcxfQ.6VvsQruq3POBdA3j0g7eD-6Pz6NIVcuMQhRwxA6AiMA";

// Same device ID used by the backend
const DEVICE_ID = process.env.SMARTNEST_DEVICE_ID || "SmartNest_001";

const socket = io("http://localhost:3000", {
  auth: {
    token: ACCESS_TOKEN,
  },

  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("=================================");
  console.log("Connected");
  console.log("Socket ID:", socket.id);
  console.log("=================================");

  socket.emit("subscribe", DEVICE_ID);

  console.log("Subscribed to", DEVICE_ID);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});

socket.on("connect_error", (err) => {
  console.log("Connection Error:");
  console.log(err.message);
});

socket.onAny((event, data) => {
  console.log("\n========== EVENT ==========");
  console.log(event);
  console.dir(data, { depth: null });
});