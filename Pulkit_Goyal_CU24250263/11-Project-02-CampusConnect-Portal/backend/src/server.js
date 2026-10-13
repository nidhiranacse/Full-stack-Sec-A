require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    portal: 'CampusConnect University Enterprise System',
    author: {
      name: 'Pulkit Goyal',
      cuid: 'CU24250263',
      roll: 40,
      section: 'A'
    }
  });
});

connectDB().finally(() => {
  app.listen(PORT, () => {
    console.log(`✓ CampusConnect API Server listening on port ${PORT}`);
    console.log(`  Student: Pulkit Goyal (CU24250263 | Roll 40 | Sec A)`);
  });
});

module.exports = app;
