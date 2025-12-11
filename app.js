document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
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
  const githubLink = document.getElementById('github-link');

  // State
  let currentPassword = '';
  let logs = [];

  // Initialize
  checkServerStatus();
  updateGithubLink();

  // Event Listeners
  randomLengthBtn.addEventListener('click', () => {
    lengthInput.value = Math.floor(Math.random() * (128 - 8 + 1)) + 8;
  });

  generateBtn.addEventListener('click', generatePassword);
  generateMultipleBtn.addEventListener('click', generateMultiplePasswords);
  copyBtn.addEventListener('click', copyPassword);
  apiTestBtn.addEventListener('click', testAPIEndpoints);

  // Generate single password
  async function generatePassword() {
    const length = parseInt(lengthInput.value);
    const includeUpper = uppercaseCheckbox.checked;
    const includeLower = lowercaseCheckbox.checked;
    const includeNumbers = numbersCheckbox.checked;
    const includeSymbols = symbolsCheckbox.checked;

    // Validation
    if (!includeUpper && !includeLower && !includeNumbers && !includeSymbols) {
      showAlert('Ошибка', 'Выберите хотя бы один тип символов!', 'error');
      return;
    }

    if (length < 8 || length > 128) {
      showAlert('Ошибка', 'Длина пароля должна быть от 8 до 128 символов.', 'error');
      return;
    }

    try {
      // Generate password via API
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
        currentPassword = data.password;
        resultDiv.textContent = currentPassword;
        multipleResultsDiv.innerHTML = '';
        
        // Update password strength
        updatePasswordStrength(currentPassword);
        
        // Enable copy button
        copyBtn.disabled = false;
        
        // Add to logs
        addLog('POST', '/api/passwords/generate', 'Пароль сгенерирован');
      } else {
        showAlert('Ошибка API', data.error, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('Ошибка', 'Не удалось подключиться к серверу', 'error');
      // Fallback to client-side generation
      generatePasswordLocally();
    }
  }

  // Generate multiple passwords
  async function generateMultiplePasswords() {
    const length = parseInt(lengthInput.value);
    const includeUpper = uppercaseCheckbox.checked;
    const includeLower = lowercaseCheckbox.checked;
    const includeNumbers = numbersCheckbox.checked;
    const includeSymbols = symbolsCheckbox.checked;

    // Validation
    if (!includeUpper && !includeLower && !includeNumbers && !includeSymbols) {
      showAlert('Ошибка', 'Выберите хотя бы один тип символов!', 'error');
      return;
    }

    if (length < 8 || length > 128) {
      showAlert('Ошибка', 'Длина пароля должна быть от 8 до 128 символов.', 'error');
      return;
    }

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
        resultDiv.textContent = 'Сгенерировано несколько паролей:';
        multipleResultsDiv.innerHTML = '';
        
        data.passwords.forEach((password, index) => {
          const passwordDiv = document.createElement('div');
          passwordDiv.className = 'password-item';
          passwordDiv.innerHTML = `
            <strong>Пароль ${index + 1}:</strong> ${password}
            <button class="copy-small-btn" data-password="${password}">
              <i class="far fa-copy"></i>
            </button>
          `;
          multipleResultsDiv.appendChild(passwordDiv);
        });

        // Add event listeners to copy buttons
        document.querySelectorAll('.copy-small-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            navigator.clipboard.writeText(this.getAttribute('data-password'))
              .then(() => {
                showAlert('Успех', 'Пароль скопирован в буфер обмена!', 'success');
              });
          });
        });

        // Update strength with first password
        updatePasswordStrength(data.passwords[0]);
        
        // Disable main copy button
        copyBtn.disabled = true;
        
        // Add to logs
        addLog('POST', '/api/passwords/bulk', 'Сгенерировано 5 паролей');
      } else {
        showAlert('Ошибка API', data.error, 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showAlert('Ошибка', 'Не удалось подключиться к серверу', 'error');
    }
  }

  // Client-side fallback password generation
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

    currentPassword = password;
    resultDiv.textContent = currentPassword;
    updatePasswordStrength(currentPassword);
    copyBtn.disabled = false;
    
    addLog('CLIENT', 'local-generation', 'Пароль сгенерирован локально');
  }

  // Copy password to clipboard
  function copyPassword() {
    if (!currentPassword) return;

    navigator.clipboard.writeText(currentPassword)
      .then(() => {
        showAlert('Успех', 'Пароль скопирован в буфер обмена!', 'success');
        addLog('CLIENT', 'clipboard', 'Пароль скопирован');
      })
      .catch(err => {
        console.error('Copy failed:', err);
        showAlert('Ошибка', 'Не удалось скопировать пароль', 'error');
      });
  }

  // Test API endpoints
  async function testAPIEndpoints() {
    try {
      // Test GET endpoint
      const getResponse = await fetch('/api/passwords/generate?length=16&uppercase=true&lowercase=true&numbers=true&symbols=true');
      const getData = await getResponse.json();
      
      // Test POST endpoint
      const postResponse = await fetch('/api/passwords/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ length: 20, uppercase: true, lowercase: true, numbers: true, symbols: false })
      });
      const postData = await postResponse.json();
      
      // Test bulk endpoint
      const bulkResponse = await fetch('/api/passwords/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 3, length: 12, uppercase: true, lowercase: true, numbers: true, symbols: true })
      });
      const bulkData = await bulkResponse.json();
      
      let message = `
        <strong>Тестирование API завершено успешно!</strong><br><br>
        <strong>GET /api/passwords/generate:</strong><br>
        Пароль: ${getData.password}<br><br>
        
        <strong>POST /api/passwords/generate:</strong><br>
        Пароль: ${postData.password}<br><br>
        
        <strong>POST /api/passwords/bulk:</strong><br>
        Сгенерировано: ${bulkData.passwords.length} паролей<br>
        Первый пароль: ${bulkData.passwords[0]}
      `;
      
      showAlert('Тест API', message, 'info');
      
      addLog('GET', '/api/passwords/generate', 'Тестирование API');
      addLog('POST', '/api/passwords/generate', 'Тестирование API');
      addLog('POST', '/api/passwords/bulk', 'Тестирование API');
    } catch (error) {
      showAlert('Ошибка тестирования', 'Не удалось протестировать API: ' + error.message, 'error');
    }
  }

  // Check server status
  async function checkServerStatus() {
    try {
      const response = await fetch('/api/passwords/health');
      if (response.ok) {
        serverStatusDiv.className = 'status-success';
        serverStatusDiv.innerHTML = '<i class="fas fa-check-circle"></i> Сервер работает нормально';
      } else {
        throw new Error('Server responded with ' + response.status);
      }
    } catch (error) {
      serverStatusDiv.className = 'status-error';
      serverStatusDiv.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Сервер недоступен';
    }
  }

  // Update password strength indicator
  function updatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 12) strength += 25;
    if (password.length >= 16) strength += 10;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 15;
    
    // Clamp to 100%
    strength = Math.min(strength, 100);
    
    // Update UI
    strengthBar.style.width = `${strength}%`;
    
    // Update text and color
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

  // Add log entry
  function addLog(method, endpoint, message) {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = `
      <span class="log-time">${timestamp}</span>
      <span class="log-method ${method.toLowerCase()}">${method}</span>
      <span class="log-endpoint">${endpoint}</span>
      <span class="log-message">${message}</span>
    `;
    
    logsDiv.insertBefore(logEntry, logsDiv.firstChild);
    
    // Keep only last 10 logs
    if (logsDiv.children.length > 10) {
      logsDiv.removeChild(logsDiv.lastChild);
    }
  }

  // Show alert
  function showAlert(title, message, type = 'info') {
    // Remove existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) {
      existingAlert.remove();
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `custom-alert alert-${type}`;
    alertDiv.innerHTML = `
      <div class="alert-content">
        <h4>${title}</h4>
        <p>${message}</p>
        <button class="alert-close">&times;</button>
      </div>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .custom-alert {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1000;
        min-width: 300px;
        max-width: 500px;
        border-radius: 8px;
        padding: 15px;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
      
      .alert-error {
        background: #f8d7da;
        border: 1px solid #f5c6cb;
        color: #721c24;
      }
      
      .alert-success {
        background: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
      }
      
      .alert-info {
        background: #d1ecf1;
        border: 1px solid #bee5eb;
        color: #0c5460;
      }
      
      .alert-content {
        position: relative;
      }
      
      .alert-content h4 {
        margin-top: 0;
        margin-bottom: 10px;
      }
      
      .alert-close {
        position: absolute;
        top: -10px;
        right: -10px;
        background: rgba(0,0,0,0.2);
        border: none;
        border-radius: 50%;
        width: 25px;
        height: 25px;
        color: white;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    
    document.head.appendChild(style);
    
    // Close button
    alertDiv.querySelector('.alert-close').addEventListener('click', () => {
      alertDiv.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.remove();
      }
    }, 5000);
  }

  // Update GitHub link
  function updateGithubLink() {
    // You should update this with your actual GitHub repository URL
    githubLink.href = 'https://github.com/yourusername/password-generator-express';
  }

  // Initial password generation
  generatePasswordLocally();
});