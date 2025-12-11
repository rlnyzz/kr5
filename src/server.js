const express = require('express');
const path = require('path');
const passwordRoutes = require('./src/passwordRoutes');
const logger = require('./src/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use(logger);

// Routes
app.use('/api/passwords', passwordRoutes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '.index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});