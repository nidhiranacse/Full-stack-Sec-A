const express = require('express');
const cors = require('cors');
const config = require('./config');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
app.set('trust proxy', 1); // correct client IP behind Render/Railway proxies (rate limiting)
app.use(cors({ origin: config.clientUrl === '*' ? true : config.clientUrl.split(',') }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'CampusConnect', author: 'Radha Pandey (CSE)' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/resources', require('./routes/resources'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
