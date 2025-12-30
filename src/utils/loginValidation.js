/**
 * Login Validation Utility Functions
 * Provides comprehensive validation for login credentials with detailed error messages
 */

/**
 * Validates email format and presence
 * @param {string} email - Email address to validate
 * @returns {Object} - Validation result with isValid status and error message
 */
export const validateEmail = (email) => {
  // Check if email is provided
  if (!email) {
    return {
      isValid: false,
      error: 'Email address is required'
    };
  }

  // Check if email is empty string
  if (typeof email !== 'string' || email.trim().length === 0) {
    return {
      isValid: false,
      error: 'Email address cannot be empty'
    };
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  // Check for common email mistakes
  const commonDomains = ['.com', '.org', '.net', '.edu', '.gov', '.mil'];
  const hasValidDomain = commonDomains.some(domain => 
    email.toLowerCase().includes(domain)
  );

  if (!hasValidDomain) {
    return {
      isValid: false,
      error: 'Please enter a valid email address with a proper domain'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validates password format and presence
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with isValid status and error message
 */
export const validatePassword = (password) => {
  // Check if password is provided
  if (!password) {
    return {
      isValid: false,
      error: 'Password is required'
    };
  }

  // Check if password is empty string
  if (typeof password !== 'string' || password.length === 0) {
    return {
      isValid: false,
      error: 'Password cannot be empty'
    };
  }

  // Check minimum password length
  if (password.length < 6) {
    return {
      isValid: false,
      error: 'Password must be at least 6 characters long'
    };
  }

  // Check for spaces (optional - can be removed if spaces in password are allowed)
  if (password.includes(' ')) {
    return {
      isValid: false,
      error: 'Password cannot contain spaces'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validates complete login credentials
 * @param {Object} credentials - Login credentials object
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Object} - Complete validation result
 */
export const validateLoginCredentials = (credentials) => {
  const { email, password } = credentials;

  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return {
      isValid: false,
      field: 'email',
      error: emailValidation.error
    };
  }

  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return {
      isValid: false,
      field: 'password',
      error: passwordValidation.error
    };
  }

  return {
    isValid: true,
    field: null,
    error: null
  };
};

/**
 * Sanitizes input data to prevent common security issues
 * @param {Object} data - Input data to sanitize
 * @returns {Object} - Sanitized data
 */
export const sanitizeLoginData = (data) => {
  const sanitized = {};

  // Sanitize email - remove extra whitespace and convert to lowercase
  if (data.email) {
    sanitized.email = data.email.trim().toLowerCase();
  }

  // Sanitize password - just trim, don't modify the actual password content
  if (data.password) {
    sanitized.password = data.password.trim();
  }

  return sanitized;
};

/**
 * Rate limiting check for login attempts (to be used with rate limiter)
 * @param {Object} req - Express request object
 * @returns {Object} - Rate limiting result
 */
export const checkLoginRateLimit = (req) => {
  // This function can be extended to integrate with actual rate limiting
  // For now, it returns a basic structure that can be used with existing rate limiters
  
  return {
    allowed: true,
    remaining: 5, // Example: 5 login attempts remaining
    resetTime: null
  };
};

/**
 * Comprehensive login validation with security considerations
 * @param {Object} credentials - Login credentials
 * @returns {Object} - Complete validation result with security flags
 */
export const comprehensiveLoginValidation = (credentials) => {
  // First sanitize the input
  const sanitizedData = sanitizeLoginData(credentials);
  
  // Validate the sanitized data
  const validationResult = validateLoginCredentials(sanitizedData);
  
  // Add additional security checks
  const securityChecks = {
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(sanitizedData.password || ''),
    hasNumbers: /\d/.test(sanitizedData.password || ''),
    hasLetters: /[a-zA-Z]/.test(sanitizedData.password || ''),
    isCommonPassword: false // This could be extended with a common passwords list
  };

  // Check for very common passwords (basic list)
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', '123456789'];
  if (sanitizedData.password && commonPasswords.includes(sanitizedData.password.toLowerCase())) {
    securityChecks.isCommonPassword = true;
  }

  return {
    ...validationResult,
    sanitizedData,
    securityChecks,
    timestamp: new Date().toISOString()
  };
};