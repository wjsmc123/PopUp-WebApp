#!/usr/bin/env node

/**
 * Setup Verification Script
 * Checks if the Next.js migration is properly configured
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}╔════════════════════════════════════════════════╗${RESET}`);
console.log(`${BLUE}║  Pop Up Hotel - Migration Setup Verification  ║${RESET}`);
console.log(`${BLUE}╚════════════════════════════════════════════════╝${RESET}\n`);

let errors = 0;
let warnings = 0;

// Check 1: Required Files
console.log(`${BLUE}[1/5] Checking required files...${RESET}`);
const requiredFiles = [
  'package.json',
  'next.config.js',
  'tsconfig.json',
  'tailwind.config.ts',
  'postcss.config.js',
  '.env.local.example',
  'app/layout.tsx',
  'app/page.tsx',
  'app/login/page.tsx',
  'app/actions.ts',
  'lib/utils.ts',
  'types/index.ts',
];

requiredFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`  ${GREEN}✓${RESET} ${file}`);
  } else {
    console.log(`  ${RED}✗${RESET} ${file} ${RED}(missing)${RESET}`);
    errors++;
  }
});
// Check 2: Environment Configuration
console.log(`\n${BLUE}[2/5] Checking environment configuration...${RESET}`);
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  console.log(`  ${GREEN}✓${RESET} .env.local exists`);
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your_supabase_project_url')) {
    console.log(`  ${YELLOW}⚠${RESET} .env.local contains placeholder values`);
    warnings++;
  } else {
    console.log(`  ${GREEN}✓${RESET} .env.local configured`);
  }
} else {
  console.log(`  ${YELLOW}⚠${RESET} .env.local not found (copy from .env.local.example)`);
  warnings++;
}

// Check 3: Dependencies
console.log(`\n${BLUE}[3/5] Checking dependencies...${RESET}`);
const nodeModulesPath = path.join(process.cwd(), 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log(`  ${GREEN}✓${RESET} node_modules exists`);
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
  const requiredDeps = ['next', 'react', 'react-dom', '@supabase/ssr', 'zustand', 'lucide-react'];
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`  ${GREEN}✓${RESET} ${dep}`);
    } else {
      console.log(`  ${RED}✗${RESET} ${dep} ${RED}(missing from package.json)${RESET}`);
      errors++;
    }
  });
} else {
  console.log(`  ${RED}✗${RESET} node_modules not found (run: npm install)`);
  errors++;
}

// Check 4: Project Structure
console.log(`\n${BLUE}[4/5] Checking project structure...${RESET}`);
const requiredDirs = [
  'app',
  'components',
  'lib',
  'types',
  'lib/supabase',
  'lib/store',
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);
  if (fs.existsSync(dirPath)) {
    console.log(`  ${GREEN}✓${RESET} ${dir}/`);
  } else {
    console.log(`  ${RED}✗${RESET} ${dir}/ ${RED}(missing)${RESET}`);
    errors++;
  }
});

// Check 5: Old Files
console.log(`\n${BLUE}[5/5] Checking for old SPA files...${RESET}`);
const oldFiles = ['index.tsx', 'index.html', 'vite.config.ts'];
const oldFilesExist = oldFiles.filter(file => fs.existsSync(path.join(process.cwd(), file)));

if (oldFilesExist.length > 0) {
  console.log(`  ${YELLOW}⚠${RESET} Old SPA files detected (can be removed after verification):`);
  oldFilesExist.forEach(file => {
    console.log(`    - ${file}`);
  });
  warnings++;
} else {
  console.log(`  ${GREEN}✓${RESET} No old SPA files found`);
}

// Summary
console.log(`\n${BLUE}╔════════════════════════════════════════════════╗${RESET}`);
console.log(`${BLUE}║                    Summary                     ║${RESET}`);
console.log(`${BLUE}╚════════════════════════════════════════════════╝${RESET}`);

if (errors === 0 && warnings === 0) {
  console.log(`\n${GREEN}✓ All checks passed! Your migration is ready.${RESET}`);
  console.log(`\nNext steps:`);
  console.log(`  1. Configure .env.local with your Supabase credentials`);
  console.log(`  2. Run: ${BLUE}npm run dev${RESET}`);
  console.log(`  3. Visit: ${BLUE}http://localhost:3000${RESET}`);
} else {
  if (errors > 0) {
    console.log(`\n${RED}✗ ${errors} error(s) found${RESET}`);
  }
  if (warnings > 0) {
    console.log(`${YELLOW}⚠ ${warnings} warning(s) found${RESET}`);
  }
  
  console.log(`\n${YELLOW}Action required:${RESET}`);
  if (errors > 0) {
    console.log(`  1. Fix errors listed above`);
    console.log(`  2. Run: ${BLUE}npm install${RESET}`);
  }
  if (warnings > 0 && !fs.existsSync(path.join(__dirname, '.env.local'))) {
    console.log(`  3. Copy: ${BLUE}cp .env.local.example .env.local${RESET}`);
    console.log(`  4. Edit .env.local with your Supabase credentials`);
  }
}

console.log(`\n${BLUE}For detailed migration guide, see: MIGRATION.md${RESET}\n`);

process.exit(errors > 0 ? 1 : 0);
