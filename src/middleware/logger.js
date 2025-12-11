const logger = (req, res, next) => {
  const timestamp = new Date().toLocaleTimeString('ru-RU');
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  
  // Логируем тело запроса для POST запросов
  if (method === 'POST' && req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Тело запроса:', JSON.stringify(req.body, null, 2));
  }
  
  // Логируем query параметры для GET запросов
  if (method === 'GET' && Object.keys(req.query).length > 0) {
    console.log('🔍 Query параметры:', req.query);
  }
  
  next();
};

module.exports = logger;