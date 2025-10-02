#!/usr/bin/env node

/**
 * Setup Validation Script
 *
 * This script validates that the development environment is properly configured
 * and all required dependencies are installed.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

function header(message) {
  console.log('');
  log('━'.repeat(60), 'cyan');
  log(`  ${message}`, 'bright');
  log('━'.repeat(60), 'cyan');
  console.log('');
}

function checkCommand(command, name) {
  try {
    const version = execSync(`${command} --version`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    success(`${name} is installed: ${version.split('\n')[0]}`);
    return true;
  } catch (err) {
    error(`${name} is not installed or not in PATH`);
    return false;
  }
}

function checkFile(filePath, name) {
  if (fs.existsSync(filePath)) {
    success(`${name} exists`);
    return true;
  } else {
    error(`${name} not found at: ${filePath}`);
    return false;
  }
}

function checkDirectory(dirPath, name) {
  if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
    success(`${name} directory exists`);
    return true;
  } else {
    error(`${name} directory not found at: ${dirPath}`);
    return false;
  }
}

function readEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const vars = {};
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          vars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return vars;
  } catch (err) {
    return null;
  }
}

// Validation checks
const checks = {
  nodeVersion: () => {
    header('Checking Node.js Version');
    try {
      const version = process.version;
      const majorVersion = parseInt(version.slice(1).split('.')[0]);

      if (majorVersion >= 18) {
        success(`Node.js version ${version} meets minimum requirement (v18.0.0+)`);
        return true;
      } else {
        error(`Node.js version ${version} is too old. Please upgrade to v18.0.0 or higher`);
        return false;
      }
    } catch (err) {
      error('Failed to check Node.js version');
      return false;
    }
  },

  npmVersion: () => {
    header('Checking Package Manager');
    return checkCommand('npm', 'npm');
  },

  gitVersion: () => {
    header('Checking Git');
    return checkCommand('git', 'Git');
  },

  projectStructure: () => {
    header('Checking Project Structure');
    const rootDir = path.resolve(__dirname, '..');
    let allGood = true;

    const requiredDirs = [
      'src',
      'src/components',
      'src/pages',
      'src/services',
      'src/hooks',
      'src/utils',
      'src/types',
      'public',
    ];

    requiredDirs.forEach(dir => {
      const dirPath = path.join(rootDir, dir);
      if (!checkDirectory(dirPath, dir)) {
        allGood = false;
      }
    });

    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.js',
      'index.html',
    ];

    requiredFiles.forEach(file => {
      const filePath = path.join(rootDir, file);
      if (!checkFile(filePath, file)) {
        allGood = false;
      }
    });

    return allGood;
  },

  dependencies: () => {
    header('Checking Dependencies');
    const rootDir = path.resolve(__dirname, '..');
    const nodeModulesPath = path.join(rootDir, 'node_modules');

    if (!checkDirectory(nodeModulesPath, 'node_modules')) {
      warning('Dependencies are not installed. Run: npm install');
      return false;
    }

    const packageJsonPath = path.join(rootDir, 'package.json');
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      const criticalDeps = [
        'react',
        'react-dom',
        'typescript',
        'vite',
        'tailwindcss',
        'firebase',
        'mapbox-gl',
      ];

      let allInstalled = true;
      criticalDeps.forEach(dep => {
        const depPath = path.join(nodeModulesPath, dep);
        if (fs.existsSync(depPath)) {
          success(`${dep} is installed (${allDeps[dep] || 'version unknown'})`);
        } else {
          error(`${dep} is not installed`);
          allInstalled = false;
        }
      });

      return allInstalled;
    } catch (err) {
      error('Failed to check dependencies');
      return false;
    }
  },

  environmentVariables: () => {
    header('Checking Environment Variables');
    const rootDir = path.resolve(__dirname, '..');
    const envPath = path.join(rootDir, '.env');
    const envExamplePath = path.join(rootDir, 'env.example');

    // Check if env.example exists
    if (!checkFile(envExamplePath, 'env.example')) {
      return false;
    }

    // Check if .env exists
    if (!fs.existsSync(envPath)) {
      error('.env file not found');
      warning('Copy env.example to .env and configure it:');
      info('  cp env.example .env');
      return false;
    }

    success('.env file exists');

    // Read and validate environment variables
    const envVars = readEnvFile(envPath);
    if (!envVars) {
      error('Failed to read .env file');
      return false;
    }

    const requiredVars = [
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

    const placeholderValues = [
      'your_mapbox_access_token_here',
      'your_firebase_api_key',
      'your-project-id',
      'your_messaging_sender_id',
      'your_firebase_app_id',
      'your_measurement_id',
      'your_vapid_key',
    ];

    let allConfigured = true;
    requiredVars.forEach(varName => {
      const value = envVars[varName];

      if (!value || value.trim() === '') {
        error(`${varName} is not set`);
        allConfigured = false;
      } else if (placeholderValues.some(placeholder =>
        value.toLowerCase().includes(placeholder.toLowerCase())
      )) {
        warning(`${varName} contains placeholder value - please update with actual credentials`);
        allConfigured = false;
      } else {
        success(`${varName} is configured`);
      }
    });

    if (!allConfigured) {
      console.log('');
      warning('Some environment variables need to be configured');
      info('Update your .env file with actual credentials');
    }

    return allConfigured;
  },

  typescript: () => {
    header('Checking TypeScript Configuration');
    const rootDir = path.resolve(__dirname, '..');

    try {
      execSync('npx tsc --version', {
        cwd: rootDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      success('TypeScript is working');

      // Try to run type check
      info('Running type check...');
      try {
        execSync('npx tsc --noEmit', {
          cwd: rootDir,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        success('No TypeScript errors found');
        return true;
      } catch (err) {
        warning('TypeScript errors detected. Run: npm run type-check');
        return true; // Don't fail on type errors
      }
    } catch (err) {
      error('TypeScript check failed');
      return false;
    }
  },

  buildTest: () => {
    header('Testing Build Configuration');
    const rootDir = path.resolve(__dirname, '..');

    info('This may take a moment...');
    try {
      execSync('npm run build', {
        cwd: rootDir,
        stdio: ['pipe', 'pipe', 'pipe']
      });
      success('Build completed successfully');

      // Check if dist folder was created
      const distPath = path.join(rootDir, 'dist');
      if (checkDirectory(distPath, 'dist')) {
        success('Build output generated in dist/ directory');
        return true;
      }
      return false;
    } catch (err) {
      error('Build failed');
      warning('Run: npm run build');
      info('Check console for detailed error messages');
      return false;
    }
  },
};

// Main validation function
async function validateSetup() {
  console.log('');
  log('═'.repeat(60), 'cyan');
  log('  RIDEFRONT SETUP VALIDATION', 'bright');
  log('═'.repeat(60), 'cyan');
  console.log('');

  const results = {
    passed: [],
    failed: [],
    warnings: [],
  };

  // Run all checks
  const checkNames = [
    'nodeVersion',
    'npmVersion',
    'gitVersion',
    'projectStructure',
    'dependencies',
    'environmentVariables',
    'typescript',
  ];

  for (const checkName of checkNames) {
    try {
      const result = checks[checkName]();
      if (result) {
        results.passed.push(checkName);
      } else {
        results.failed.push(checkName);
      }
    } catch (err) {
      error(`Check '${checkName}' threw an error: ${err.message}`);
      results.failed.push(checkName);
    }
  }

  // Optional build test (commented out by default as it takes time)
  // Uncomment to include build test
  // const buildResult = checks.buildTest();
  // if (buildResult) {
  //   results.passed.push('buildTest');
  // } else {
  //   results.failed.push('buildTest');
  // }

  // Summary
  header('Validation Summary');

  log(`Passed: ${results.passed.length}`, 'green');
  log(`Failed: ${results.failed.length}`, results.failed.length > 0 ? 'red' : 'green');

  console.log('');

  if (results.failed.length === 0) {
    log('═'.repeat(60), 'green');
    log('  ✅ ALL CHECKS PASSED!', 'green');
    log('═'.repeat(60), 'green');
    console.log('');
    success('Your development environment is properly configured');
    info('You can now start developing:');
    console.log('');
    log('  npm run dev     - Start development server', 'cyan');
    log('  npm run build   - Build for production', 'cyan');
    log('  npm run lint    - Run linter', 'cyan');
    console.log('');
    process.exit(0);
  } else {
    log('═'.repeat(60), 'red');
    log('  ❌ VALIDATION FAILED', 'red');
    log('═'.repeat(60), 'red');
    console.log('');
    error('Please fix the issues above before continuing');
    console.log('');
    info('Common fixes:');
    console.log('');
    log('  1. Install dependencies:     npm install', 'cyan');
    log('  2. Configure environment:    cp env.example .env', 'cyan');
    log('  3. Update .env file with your actual credentials', 'cyan');
    console.log('');
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  validateSetup().catch(err => {
    error(`Validation script failed: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { validateSetup, checks };
