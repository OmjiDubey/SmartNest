const express = require('express');
const authRoutes = require('./routes/auth.Routes');
const deviceRoutes = require("./routes/device.routes");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);

app.get('/', (req, res) => {
  res.send('SmartNest Backend Running');
});

module.exports = app;