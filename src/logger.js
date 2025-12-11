const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  
  console.log(`[${timestamp}] ${method} ${url}`);
  
  // Log request body for POST requests
  if (method === 'POST' && req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  
  // Log query parameters for GET requests
  if (method === 'GET' && Object.keys(req.query).length > 0) {
    console.log('Query params:', req.query);
  }
  
  next();
};

module.exports = logger;