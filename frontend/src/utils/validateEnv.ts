/**
 * Environment Variable Validation Utility
 *
 * This utility validates that all required environment variables are present
 * and properly configured before the application starts.
 */

interface EnvConfig {
  // API Configuration
  VITE_API_BASE_URL: string;

  // Mapbox Configuration
  VITE_MAPBOX_TOKEN: string;

  // Firebase Configuration
  VITE_FIREBASE_API_KEY: string;
  VITE_FIREBASE_AUTH_DOMAIN: string;
  VITE_FIREBASE_PROJECT_ID: string;
  VITE_FIREBASE_STORAGE_BUCKET: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID: string;
  VITE_FIREBASE_APP_ID: string;
  VITE_FIREBASE_MEASUREMENT_ID: string;
  VITE_FIREBASE_VAPID_KEY?: string; // Optional
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Required environment variables that must be present
 */
const REQUIRED_ENV_VARS: (keyof EnvConfig)[] = [
  'VITE_API_BASE_URL',
  'VITE_MAPBOX_TOKEN',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
];

/**
 * Optional environment variables that should have warnings if missing
 */
const OPTIONAL_ENV_VARS: (keyof EnvConfig)[] = [
  'VITE_FIREBASE_VAPID_KEY',
];

/**
 * Placeholder values that should not be used in production
 */
const PLACEHOLDER_VALUES = [
  'your_mapbox_access_token_here',
  'your_firebase_api_key',
  'your-project-id',
  'your_messaging_sender_id',
  'your_firebase_app_id',
  'your_measurement_id',
  'your_vapid_key_for_push_notifications',
];

/**
 * Check if a value is a placeholder
 */
function isPlaceholder(value: string): boolean {
  return PLACEHOLDER_VALUES.some(placeholder =>
    value.toLowerCase().includes(placeholder.toLowerCase())
  );
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate that all required environment variables are present and valid
 */
export function validateEnv(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = import.meta.env[varName];

    if (!value || value.trim() === '') {
      errors.push(`❌ Missing required environment variable: ${varName}`);
      continue;
    }

    // Check for placeholder values
    if (isPlaceholder(value)) {
      errors.push(
        `❌ Environment variable ${varName} contains placeholder value. ` +
        `Please update with your actual credentials.`
      );
      continue;
    }

    // Validate specific formats
    if (varName === 'VITE_API_BASE_URL' && !isValidUrl(value)) {
      errors.push(`❌ Invalid URL format for ${varName}: ${value}`);
    }

    if (varName === 'VITE_MAPBOX_TOKEN' && !value.startsWith('pk.')) {
      warnings.push(`⚠️  ${varName} should start with 'pk.' for public tokens`);
    }

    if (varName === 'VITE_FIREBASE_AUTH_DOMAIN' && !value.includes('firebaseapp.com')) {
      warnings.push(`⚠️  ${varName} should typically contain 'firebaseapp.com'`);
    }
  }

  // Check optional environment variables
  for (const varName of OPTIONAL_ENV_VARS) {
    const value = import.meta.env[varName];

    if (!value || value.trim() === '') {
      warnings.push(`⚠️  Optional environment variable not set: ${varName}`);
    } else if (isPlaceholder(value)) {
      warnings.push(
        `⚠️  Environment variable ${varName} contains placeholder value. ` +
        `Some features may not work properly.`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get a typed environment configuration object
 */
export function getEnvConfig(): EnvConfig {
  return {
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
    VITE_MAPBOX_TOKEN: import.meta.env.VITE_MAPBOX_TOKEN || '',
    VITE_FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
    VITE_FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    VITE_FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    VITE_FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    VITE_FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    VITE_FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
    VITE_FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
    VITE_FIREBASE_VAPID_KEY: import.meta.env.VITE_FIREBASE_VAPID_KEY,
  };
}

/**
 * Log validation results to console
 */
export function logValidationResults(result: ValidationResult): void {
  if (result.isValid && result.warnings.length === 0) {
    console.log('✅ All environment variables are properly configured');
    return;
  }

  console.group('🔧 Environment Configuration Status');

  if (result.errors.length > 0) {
    console.group('❌ Errors (must be fixed):');
    result.errors.forEach(error => console.error(error));
    console.groupEnd();
  }

  if (result.warnings.length > 0) {
    console.group('⚠️  Warnings (recommended to fix):');
    result.warnings.forEach(warning => console.warn(warning));
    console.groupEnd();
  }

  console.groupEnd();

  if (result.errors.length > 0) {
    console.error(
      '\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '  Configuration Error\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n' +
      '\n' +
      '  The application cannot start due to missing or invalid\n' +
      '  environment variables.\n' +
      '\n' +
      '  To fix this:\n' +
      '  1. Copy env.example to .env:\n' +
      '     cp env.example .env\n' +
      '\n' +
      '  2. Update the .env file with your actual credentials\n' +
      '\n' +
      '  3. Restart the development server\n' +
      '\n' +
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'
    );
  }
}

/**
 * Validate environment and throw error if invalid
 * Use this at application startup
 */
export function validateEnvOrThrow(): void {
  const result = validateEnv();
  logValidationResults(result);

  if (!result.isValid) {
    throw new Error(
      'Application startup failed due to invalid environment configuration. ' +
      'Please check the console for details.'
    );
  }
}

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

/**
 * Get the current environment mode
 */
export function getMode(): string {
  return import.meta.env.MODE || 'development';
}

export default {
  validateEnv,
  validateEnvOrThrow,
  getEnvConfig,
  logValidationResults,
  isDevelopment,
  isProduction,
  getMode,
};
