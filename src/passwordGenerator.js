const generatePassword = (length = 12, options = {}) => {
  const {
    uppercase = true,
    lowercase = true,
    numbers = true,
    symbols = false
  } = options;

  let charset = '';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (uppercase) charset += uppercaseChars;
  if (lowercase) charset += lowercaseChars;
  if (numbers) charset += numberChars;
  if (symbols) charset += symbolChars;

  if (charset.length === 0) {
    throw new Error('At least one character type must be selected');
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

module.exports = { generatePassword };