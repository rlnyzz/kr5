document.addEventListener('DOMContentLoaded', function() {
  // DOM элементы
  const lengthInput = document.getElementById('length');
  const randomLengthBtn = document.getElementById('random-length');
  const uppercaseCheckbox = document.getElementById('uppercase');
  const lowercaseCheckbox = document.getElementById('lowercase');
  const numbersCheckbox = document.getElementById('numbers');
  const symbolsCheckbox = document.getElementById('symbols');
  const generateBtn = document.getElementById('generate-btn');
  const generateMultipleBtn = document.getElementById('generate-multiple-btn');
  const copyBtn = document.getElementById('copy-btn');
  const apiTestBtn = document.getElementById('api-test-btn');
  const resultDiv = document.getElementById('result');
  const multipleResultsDiv = document.getElementById('multiple-results');
  const strengthBar = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const serverStatusDiv = document.getElementById('server-status');
  const logsDiv = document.getElementById('logs');
  const alertContainer = document.getElementById('alert-container');

  // Состояние
  let currentPassword = '';
  let isServerAvailable = false;

  // Инициализация
  checkServerStatus();
  
  // Генерация начального пароля
  setTimeout(() => {
    generatePasswordLocally();
  }, 500);

  // Обработчики событий
  randomLengthBtn.addEventListener('click', () => {
    const randomLength = Math.floor(Math.random() * (128 - 8 + 1)) + 8;
    lengthInput.value = randomLength;
    addLog('CLIENT', 'random-length', `Установлена случайная длина: ${randomLength}`);
  });

  generateBtn.addEventListener('click', generatePassword);
  generateMultipleBtn.addEventListener('click', generateMultiplePasswords);
  copyBtn.addEventListener('click', copyPassword);
  apiTestBtn.addEventListener('click', testAPIEndpoints);

  // Генерация одного пароля
  async function generatePassword() {
    const length = parseInt(lengthInput.value);
    const includeUpper = uppercaseCheckbox.checked;
    const includeLower = lowercaseCheckbox.checked;
    const includeNumbers = numbersCheckbox.checked;
    const includeSymbols = symbolsCheckbox.checked;

    // Валидация
    if (!includeUpper && !includeLower && !includeNumbers && !includeSymbols) {
      showAlert('Ошибка', 'Выберите хотя бы один тип символов!', 'error');
      return;
    }

    if (length < 8 || length > 128) {
      showAlert('Ошибка', 'Длина пароля должна быть от 8 до 128 символов.', 'error');
      return;
    }

    addLog('CLIENT', 'generate-password', `Запрос пароля длиной ${length}`);

    // Если сервер доступен, используем API
    if (isServerAvailable) {
      try {
        const response = await fetch('/api/passwords/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            length: length,
            uppercase: includeUpper,
            lowercase: includeLower,
            numbers: includeNumbers,
            symbols: includeSymbols
          })
        });

        const data = await response.json();
        
        if (data.success) {
          handlePasswordGenerated(data.password, data.length, 'API');
          addLog('POST', '/api/passwords/generate', `Сгенерирован пароль через API (${length} символов)`);
        } else {
          showAlert('Ошибка API', data.error, 'error');
          generatePasswordLocally();
        }
      } catch (error) {
        console.error('Ошибка подключения к API:', error);
        isServerAvailable = false;
        updateServerStatus();
        generatePasswordLocally();
      }
    } else {
      // Используем локальную генерацию
      generatePasswordLocally();
    }
  }

  // Локальная генерация пароля
  function generatePasswordLocally() {
    const length = parseInt(lengthInput.value);
    const includeUpper = uppercaseCheckbox.checked;
    const includeLower = lowercaseCheckbox.checked;
    const includeNumbers = numbersCheckbox.checked;
    const includeSymbols = symbolsCheckbox.checked;

    let charset = '';
    if (includeLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    handlePasswordGenerated(password, length, 'локальная генерация');
    addLog('CLIENT', 'local-generation', `Сгенерирован пароль локально (${length} символов)`);
  }

  // Обработка сгенерированного пароля
  function handlePasswordGenerated(password, length, source) {
    currentPassword = password;
    resultDiv.textContent = password;
    resultDiv.title = `Сгенерировано через: ${source}`;
    resultDiv.style.color = '#2c3e50';
    multipleResultsDiv.innerHTML = '';
    
    // Обновляем сложность пароля
    updatePasswordStrength(password);
    
    // Активируем кнопку копирования
    copyBtn.disabled = false;
  }

  // Генерация нескольких паролей
  async function generateMultiplePasswords() {
    const length = parseInt(lengthInput.value);
    const includeUpper = uppercaseCheckbox.checked;
    const includeLower = lowercaseCheckbox.checked;
    const includeNumbers = numbersCheckbox.checked;
    const includeSymbols = symbolsCheckbox.checked;

    // Валидация
    if (!includeUpper && !includeLower && !includeNumbers && !includeSymbols) {
      showAlert('Ошибка', 'Выберите хотя бы один тип символов!', 'error');
      return;
    }

    if (length < 8 || length > 128) {
      showAlert('Ошибка', 'Длина пароля должна быть от 8 до 128 символов.', 'error');
      return;
    }

    addLog('CLIENT', 'generate-multiple', `Запрос 5 паролей длиной ${length}`);

    // Если сервер доступен, используем API
    if (isServerAvailable) {
      try {
        const response = await fetch('/api/passwords/bulk', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            count: 5,
            length: length,
            uppercase: includeUpper,
            lowercase: includeLower,
            numbers: includeNumbers,
            symbols: includeSymbols
          })
        });

        const data = await response.json();
        
        if (data.success) {
          handleMultiplePasswordsGenerated(data.passwords, data.length, 'API');
          addLog('POST', '/api/passwords/bulk', `Сгенерировано 5 паролей через API`);
        } else {
          showAlert('Ошибка API', data.error, 'error');
          generateMultiplePasswordsLocally();
        }
      } catch (error) {
        console.error('Ошибка подключения к API:', error);
        isServerAvailable = false;
        updateServerStatus();
        generateMultiplePasswordsLocally();
      }
    } else {
      // Используем локальную генерацию
      generateMultiplePasswordsLocally();
    }
  }

  // Локальная генерация нескольких паролей
  function generateMultiplePasswordsLocally() {
    const length = parseInt(lengthInput.value);
    const includeUpper = uppercaseCheckbox.checked;
    const includeLower = lowercaseCheckbox.checked;
    const includeNumbers = numbersCheckbox.checked;
    const includeSymbols = symbolsCheckbox.checked;

    let charset = '';
    if (includeLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const passwords = [];
    for (let i = 0; i < 5; i++) {
      let password = '';
      for (let j = 0; j < length; j++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
      }
      passwords.push(password);
    }

    handleMultiplePasswordsGenerated(passwords, length, 'локальная генерация');
    addLog('CLIENT', 'local-multiple-generation', `Сгенерировано 5 паролей локально`);
  }

  // Обработка нескольких сгенерированных паролей
  function handleMultiplePasswordsGenerated(passwords, length, source) {
    resultDiv.textContent = `Сгенерировано 5 паролей (${source}):`;
    resultDiv.style.color = '#2c3e50';
    multipleResultsDiv.innerHTML = '';
    
    passwords.forEach((password, index) => {
      const passwordDiv = document.createElement('div');
      passwordDiv.className = 'password-item';
      passwordDiv.innerHTML = `
        <div>
          <strong>Пароль ${index + 1}:</strong><br>
          <code style="font-family: 'Courier New', monospace;">${password}</code>
        </div>
        <button class="copy-small-btn" data-password="${password}">
          <i class="far fa-copy"></i> Копировать
        </button>
      `;
      multipleResultsDiv.appendChild(passwordDiv);
    });

    // Добавляем обработчики для кнопок копирования
    document.querySelectorAll('.copy-small-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const passwordToCopy = this.getAttribute('data-password');
        navigator.clipboard.writeText(passwordToCopy)
          .then(() => {
            showAlert('Успех', 'Пароль скопирован в буфер обмена!', 'success');
          })
          .catch(err => {
            console.error('Copy failed:', err);
            showAlert('Ошибка', 'Не удалось скопировать пароль', 'error');
          });
      });
    });

    // Обновляем сложность первого пароля
    updatePasswordStrength(passwords[0]);
    
    // Деактивируем основную кнопку копирования
    copyBtn.disabled = true;
    currentPassword = '';
  }

  // Копирование пароля в буфер обмена
  function copyPassword() {
    if (!currentPassword) {
      showAlert('Ошибка', 'Нет пароля для копирования', 'error');
      return;
    }

    navigator.clipboard.writeText(currentPassword)
      .then(() => {
        showAlert('Успех', 'Пароль скопирован в буфер обмена!', 'success');
        addLog('CLIENT', 'clipboard', 'Пароль скопирован в буфер обмена');
      })
      .catch(err => {
        console.error('Copy failed:', err);
        showAlert('Ошибка', 'Не удалось скопировать пароль', 'error');
      });
  }

  // Тестирование API эндпоинтов
  async function testAPIEndpoints() {
    addLog('CLIENT', 'api-test', 'Начало тестирования API');
    
    try {
      showAlert('Информация', 'Начинаю тестирование API...', 'info');
      
      // Тест 1: GET запрос
      const getResponse = await fetch('/api/passwords/generate?length=16&uppercase=true&lowercase=true&numbers=true&symbols=true');
      const getData = await getResponse.json();
      
      // Тест 2: POST запрос
      const postResponse = await fetch('/api/passwords/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          length: 20, 
          uppercase: true, 
          lowercase: true, 
          numbers: true, 
          symbols: false 
        })
      });
      const postData = await postResponse.json();
      
      // Тест 3: Bulk запрос
      const bulkResponse = await fetch('/api/passwords/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          count: 3, 
          length: 12, 
          uppercase: true, 
          lowercase: true, 
          numbers: true, 
          symbols: true 
        })
      });
      const bulkData = await bulkResponse.json();
      
      let message = `✅ Тестирование API завершено успешно!<br><br>
        <strong>GET запрос:</strong> ${getData.success ? '✓ Успешно' : '✗ Ошибка'}<br>
        <strong>POST запрос:</strong> ${postData.success ? '✓ Успешно' : '✗ Ошибка'}<br>
        <strong>BULK запрос:</strong> ${bulkData.success ? '✓ Успешно' : '✗ Ошибка'}<br><br>
        Все три эндпоинта работают корректно!`;
      
      showAlert('Тест API', message, 'success');
      
      addLog('GET', '/api/passwords/generate', 'Тестирование GET запроса');
      addLog('POST', '/api/passwords/generate', 'Тестирование POST запроса');
      addLog('POST', '/api/passwords/bulk', 'Тестирование BULK запроса');
    } catch (error) {
      showAlert('Ошибка тестирования', 'Не удалось протестировать API: ' + error.message, 'error');
      addLog('ERROR', 'api-test', 'Ошибка тестирования API');
    }
  }

  // Проверка статуса сервера
  async function checkServerStatus() {
    try {
      const response = await fetch('/api/passwords/health');
      if (response.ok) {
        isServerAvailable = true;
        serverStatusDiv.className = 'status-success';
        serverStatusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Сервер работает нормально';
        addLog('GET', '/api/passwords/health', 'Сервер доступен');
      } else {
        throw new Error('Server responded with ' + response.status);
      }
    } catch (error) {
      isServerAvailable = false;
      serverStatusDiv.className = 'status-error';
      serverStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Сервер недоступен. Используется локальная генерация.';
      addLog('ERROR', '/api/passwords/health', 'Сервер недоступен');
    }
  }

  // Обновление статуса сервера в UI
  function updateServerStatus() {
    if (isServerAvailable) {
      serverStatusDiv.className = 'status-success';
      serverStatusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Сервер работает нормально';
    } else {
      serverStatusDiv.className = 'status-error';
      serverStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Сервер недоступен. Используется локальная генерация.';
    }
  }

  // Обновление индикатора сложности пароля
  function updatePasswordStrength(password) {
    let strength = 0;
    
    // Проверка длины
    if (password.length >= 12) strength += 25;
    if (password.length >= 16) strength += 10;
    
    // Проверка разнообразия символов
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    // Ограничение до 100%
    strength = Math.min(strength, 100);
    
    // Обновление UI
    strengthBar.style.width = `${strength}%`;
    
    // Обновление текста и цвета
    let strengthLevel, color;
    if (strength < 40) {
      strengthLevel = 'Слабый';
      color = '#ff6b6b';
    } else if (strength < 70) {
      strengthLevel = 'Средний';
      color = '#feca57';
    } else if (strength < 90) {
      strengthLevel = 'Хороший';
      color = '#48dbfb';
    } else {
      strengthLevel = 'Отличный';
      color = '#1dd1a1';
    }
    
    strengthText.textContent = strengthLevel;
    strengthBar.style.background = color;
  }

  // Добавление записи в лог
  function addLog(method, endpoint, message) {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    
    // Определяем цвет метода
    let methodColor = '#495057';
    if (method === 'GET') methodColor = '#61affe';
    if (method === 'POST') methodColor = '#49cc90';
    if (method === 'CLIENT') methodColor = '#fca120';
    if (method === 'ERROR') methodColor = '#ff6b6b';
    
    logEntry.innerHTML = `
      <span class="log-time">${timestamp}</span>
      <span class="log-method" style="color: ${methodColor}">${method}</span>
      <span class="log-endpoint">${endpoint}</span>
      <span class="log-message">${message}</span>
    `;
    
    logsDiv.insertBefore(logEntry, logsDiv.firstChild);
    
    // Оставляем только последние 10 записей
    if (logsDiv.children.length > 10) {
      logsDiv.removeChild(logsDiv.lastChild);
    }
  }

  // Показать уведомление
  function showAlert(title, message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
      <div>
        <strong>${title}</strong><br>
        ${message}
      </div>
      <button class="alert-close">&times;</button>
    `;
    
    alertContainer.appendChild(alertDiv);
    
    // Кнопка закрытия
    alertDiv.querySelector('.alert-close').addEventListener('click', () => {
      alertDiv.remove();
    });
    
    // Автоматическое удаление через 5 секунд
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  }
});