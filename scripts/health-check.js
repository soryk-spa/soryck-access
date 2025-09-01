#!/usr/bin/env node

/**
 * SorykPass Project Health Check Script
 * Verifica las mejoras implementadas y sugiere optimizaciones adicionales
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'white') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function countLinesInFile(filePath) {
  try {
    const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

function findConsoleStatements() {
  try {
    const result = execSync('npx grep -r "console\\." src/ --include="*.ts" --include="*.tsx" | wc -l', { encoding: 'utf8' });
    return parseInt(result.trim()) || 0;
  } catch {
    // Fallback for Windows
    try {
      const result = execSync('findstr /s /i "console\\." src\\*.ts src\\*.tsx 2>nul | find /c /v ""', { encoding: 'utf8' });
      return parseInt(result.trim()) || 0;
    } catch {
      return 'unknown';
    }
  }
}

function checkPackageScripts() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.scripts || {};
  } catch {
    return {};
  }
}

function runHealthCheck() {
  log('\n🩺 SorykPass Project Health Check\n', 'bold');
  
  const checks = [
    {
      name: '📧 Email System Implementation',
      check: () => {
        const emailFile = 'src/lib/email.tsx';
        if (!checkFileExists(emailFile)) return { status: 'error', message: 'Email file not found' };
        
        const content = fs.readFileSync(emailFile, 'utf8');
        const hasTODO = content.includes('TODO');
        const hasLogger = content.includes('logger.');
        
        if (hasTODO) return { status: 'warning', message: 'Still contains TODO items' };
        if (!hasLogger) return { status: 'warning', message: 'Not using logger system' };
        return { status: 'success', message: 'Email system implemented with proper logging' };
      }
    },
    {
      name: '📊 Logging System',
      check: () => {
        const loggerFile = 'src/lib/logger.ts';
        if (!checkFileExists(loggerFile)) return { status: 'error', message: 'Logger file not found' };
        
        const lines = countLinesInFile(loggerFile);
        if (lines < 50) return { status: 'warning', message: 'Logger implementation seems incomplete' };
        return { status: 'success', message: `Professional logging system implemented (${lines} lines)` };
      }
    },
    {
      name: '🧹 Console.log Cleanup',
      check: () => {
        const consoleCount = findConsoleStatements();
        if (consoleCount === 'unknown') return { status: 'warning', message: 'Could not count console statements' };
        if (consoleCount > 10) return { status: 'warning', message: `Still has ${consoleCount} console statements` };
        if (consoleCount > 0) return { status: 'info', message: `Found ${consoleCount} console statements (acceptable)` };
        return { status: 'success', message: 'No console statements found in src/' };
      }
    },
    {
      name: '⚡ Next.js Optimizations',
      check: () => {
        const configFile = 'next.config.ts';
        if (!checkFileExists(configFile)) return { status: 'error', message: 'Next.js config not found' };
        
        const content = fs.readFileSync(configFile, 'utf8');
        const hasExperimental = content.includes('experimental');
        const hasWebpack = content.includes('webpack');
        const hasCompiler = content.includes('compiler');
        
        const optimizations = [hasExperimental, hasWebpack, hasCompiler].filter(Boolean).length;
        if (optimizations === 0) return { status: 'error', message: 'No performance optimizations found' };
        if (optimizations < 3) return { status: 'warning', message: `${optimizations}/3 optimizations implemented` };
        return { status: 'success', message: 'All performance optimizations implemented' };
      }
    },
    {
      name: '🔐 Security Middleware',
      check: () => {
        const middlewareFile = 'src/middleware.ts';
        if (!checkFileExists(middlewareFile)) return { status: 'error', message: 'Middleware file not found' };
        
        const content = fs.readFileSync(middlewareFile, 'utf8');
        const hasRateLimit = content.includes('rateLimit');
        const hasSecurityHeaders = content.includes('X-Frame-Options');
        const hasCSP = content.includes('Content-Security-Policy');
        
        const features = [hasRateLimit, hasSecurityHeaders, hasCSP].filter(Boolean).length;
        if (features === 0) return { status: 'error', message: 'No security features found' };
        if (features < 3) return { status: 'warning', message: `${features}/3 security features implemented` };
        return { status: 'success', message: 'Complete security middleware implemented' };
      }
    },
    {
      name: '🧪 Testing Configuration',
      check: () => {
        const jestConfig = 'jest.config.js';
        const testFiles = fs.readdirSync('src', { recursive: true })
          .filter(file => file.includes('.test.') || file.includes('.spec.'))
          .length;
        
        if (!checkFileExists(jestConfig)) return { status: 'error', message: 'Jest config not found' };
        if (testFiles === 0) return { status: 'warning', message: 'No test files found' };
        if (testFiles < 5) return { status: 'info', message: `${testFiles} test files found` };
        return { status: 'success', message: `Testing configured with ${testFiles} test files` };
      }
    }
  ];

  checks.forEach(({ name, check }) => {
    const result = check();
    const icon = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    }[result.status];
    
    const color = {
      success: 'green',
      warning: 'yellow',
      error: 'red',
      info: 'blue'
    }[result.status];
    
    log(`${icon} ${name}`, color);
    log(`   ${result.message}\n`, 'white');
  });

  // Package scripts check
  log('📦 Available Scripts:', 'bold');
  const scripts = checkPackageScripts();
  const importantScripts = ['dev', 'build', 'test', 'lint', 'type-check'];
  
  importantScripts.forEach(script => {
    if (scripts[script]) {
      log(`   ✅ npm run ${script}`, 'green');
    } else {
      log(`   ❌ npm run ${script} (missing)`, 'red');
    }
  });

  log('\n🚀 Next Steps Recommendations:', 'bold');
  log('   1. Run tests: npm run test', 'cyan');
  log('   2. Check TypeScript: npm run type-check', 'cyan');
  log('   3. Lint code: npm run lint', 'cyan');
  log('   4. Build for production: npm run build', 'cyan');
  log('   5. Monitor email functionality in development', 'cyan');
  
  log('\n✨ Project health check completed!', 'green');
}

runHealthCheck();
