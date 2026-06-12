const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('./middleware/errorHandler');

const deviceRoutes = require('./routes/deviceRoutes');
const energyRoutes = require('./routes/energyRoutes');
const automationRoutes = require('./routes/automationRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/devices', deviceRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/schedules', scheduleRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
