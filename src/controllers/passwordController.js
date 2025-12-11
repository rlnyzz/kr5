const { generatePassword } = require('../utils/passwordGenerator');

// Генерация пароля через POST запрос
const generate = (req, res) => {
  try {
    console.log('📝 Генерация пароля через POST запрос');
    
    const { 
      length = 12, 
      uppercase = true, 
      lowercase = true, 
      numbers = true, 
      symbols = false 
    } = req.body;
    
    // Валидация
    const passwordLength = parseInt(length);
    if (isNaN(passwordLength) || passwordLength < 8 || passwordLength > 128) {
      return res.status(400).json({ 
        success: false,
        error: 'Длина пароля должна быть числом от 8 до 128' 
      });
    }

    const options = {
      uppercase: uppercase !== false && uppercase !== 'false',
      lowercase: lowercase !== false && lowercase !== 'false',
      numbers: numbers !== false && numbers !== 'false',
      symbols: symbols === true || symbols === 'true'
    };

    const password = generatePassword(passwordLength, options);
    
    console.log(`✅ Сгенерирован пароль длиной ${passwordLength} символов`);
    
    res.json({ 
      success: true, 
      password,
      length: passwordLength,
      options,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Ошибка генерации пароля:', error.message);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Генерация нескольких паролей
const generateMultiple = (req, res) => {
  try {
    console.log('📝 Генерация нескольких паролей');
    
    const { 
      count = 5, 
      length = 12, 
      uppercase = true, 
      lowercase = true, 
      numbers = true, 
      symbols = false 
    } = req.body;
    
    const numPasswords = parseInt(count);
    if (isNaN(numPasswords) || numPasswords < 1 || numPasswords > 20) {
      return res.status(400).json({ 
        success: false,
        error: 'Количество паролей должно быть от 1 до 20' 
      });
    }

    const passwordLength = parseInt(length);
    if (isNaN(passwordLength) || passwordLength < 8 || passwordLength > 128) {
      return res.status(400).json({ 
        success: false,
        error: 'Длина пароля должна быть числом от 8 до 128' 
      });
    }

    const options = {
      uppercase: uppercase !== false && uppercase !== 'false',
      lowercase: lowercase !== false && lowercase !== 'false',
      numbers: numbers !== false && numbers !== 'false',
      symbols: symbols === true || symbols === 'true'
    };

    const passwords = [];
    for (let i = 0; i < numPasswords; i++) {
      passwords.push(generatePassword(passwordLength, options));
    }

    console.log(`✅ Сгенерировано ${numPasswords} паролей по ${passwordLength} символов`);
    
    res.json({ 
      success: true, 
      passwords,
      count: numPasswords,
      length: passwordLength,
      options,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Ошибка генерации паролей:', error.message);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Генерация пароля через GET запрос с query параметрами
const getPasswordByQuery = (req, res) => {
  try {
    console.log('📝 Генерация пароля через GET запрос');
    
    const { 
      length = 12, 
      uppercase = 'true', 
      lowercase = 'true', 
      numbers = 'true', 
      symbols = 'false' 
    } = req.query;
    
    const passwordLength = parseInt(length);
    if (isNaN(passwordLength) || passwordLength < 8 || passwordLength > 128) {
      return res.status(400).json({ 
        success: false,
        error: 'Длина пароля должна быть числом от 8 до 128' 
      });
    }

    const options = {
      uppercase: uppercase === 'true',
      lowercase: lowercase === 'true',
      numbers: numbers === 'true',
      symbols: symbols === 'true'
    };

    const password = generatePassword(passwordLength, options);
    
    console.log(`✅ Сгенерирован пароль через GET запрос длиной ${passwordLength} символов`);
    
    res.json({ 
      success: true, 
      password,
      length: passwordLength,
      options,
      generatedVia: 'query_parameters',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Ошибка генерации пароля через GET:', error.message);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = { generate, generateMultiple, getPasswordByQuery };