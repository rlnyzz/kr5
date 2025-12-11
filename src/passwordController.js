const { generatePassword } = require('./src/passwordGenerator');

const generate = (req, res) => {
  try {
    const { length = 12, uppercase, lowercase, numbers, symbols } = req.body;
    
    // Validate input
    const passwordLength = parseInt(length);
    if (isNaN(passwordLength) || passwordLength < 8 || passwordLength > 128) {
      return res.status(400).json({ 
        error: 'Password length must be a number between 8 and 128' 
      });
    }

    const options = {
      uppercase: uppercase !== 'false',
      lowercase: lowercase !== 'false',
      numbers: numbers !== 'false',
      symbols: symbols !== 'false'
    };

    const password = generatePassword(passwordLength, options);
    
    res.json({ 
      success: true, 
      password,
      length: passwordLength,
      options
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

const generateMultiple = (req, res) => {
  try {
    const { count = 5, ...params } = req.body;
    const numPasswords = parseInt(count);
    
    if (isNaN(numPasswords) || numPasswords < 1 || numPasswords > 20) {
      return res.status(400).json({ 
        error: 'Count must be a number between 1 and 20' 
      });
    }

    const passwords = [];
    for (let i = 0; i < numPasswords; i++) {
      passwords.push(generatePassword(params.length || 12, params));
    }

    res.json({ 
      success: true, 
      passwords,
      count: numPasswords
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

const getPasswordByQuery = (req, res) => {
  try {
    const { length = 12, uppercase = 'true', lowercase = 'true', 
            numbers = 'true', symbols = 'false' } = req.query;
    
    const passwordLength = parseInt(length);
    if (isNaN(passwordLength) || passwordLength < 8 || passwordLength > 128) {
      return res.status(400).json({ 
        error: 'Password length must be a number between 8 and 128' 
      });
    }

    const options = {
      uppercase: uppercase === 'true',
      lowercase: lowercase === 'true',
      numbers: numbers === 'true',
      symbols: symbols === 'true'
    };

    const password = generatePassword(passwordLength, options);
    
    res.json({ 
      success: true, 
      password,
      length: passwordLength,
      options,
      generatedVia: 'query_parameters'
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = { generate, generateMultiple, getPasswordByQuery };