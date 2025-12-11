const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Импорт контроллеров
const { generate, generateMultiple, getPasswordByQuery } = require('./controllers/passwordController');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Раздаем статические файлы из текущей директории
app.use(logger);

// Маршруты API
// GET /api/passwords/generate?length=12&uppercase=true&...
app.get('/api/passwords/generate', getPasswordByQuery);

// POST /api/passwords/generate - generate single password
app.post('/api/passwords/generate', generate);

// POST /api/passwords/bulk - generate multiple passwords
app.post('/api/passwords/bulk', generateMultiple);

// Health check endpoint
app.get('/api/passwords/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'Password Generator API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.url });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📋 Доступные эндпоинты:`);
  console.log(`   GET  /api/passwords/health`);
  console.log(`   GET  /api/passwords/generate?length=12&uppercase=true...`);
  console.log(`   POST /api/passwords/generate`);
  console.log(`   POST /api/passwords/bulk`);
  console.log(`🌐 Откройте в браузере: http://localhost:${PORT}`);
});