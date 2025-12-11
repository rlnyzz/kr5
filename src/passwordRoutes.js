const express = require('express');
const router = express.Router();
const { 
  generate, 
  generateMultiple, 
  getPasswordByQuery 
} = require('./src/passwordController');

router.get('/generate', getPasswordByQuery);

router.post('/generate', generate);

router.post('/bulk', generateMultiple);

router.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'Password Generator API' });
});

module.exports = router;