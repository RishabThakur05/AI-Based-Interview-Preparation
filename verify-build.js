#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔍 Verifying build setup...\n');

// Check if required files exist
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'src/main.jsx',
  'src/App.jsx',
  'server/index.js'
];

let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    allFilesExist = false;
  }
});

// Check package.json dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const buildDeps = ['vite', '@vitejs/plugin-react', 'react', 'react-dom'];
buildDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep} found`);
  } else {
    console.log(`❌ ${dep} missing`);
    allFilesExist = false;
  }
});

// Check scripts
console.log('\n📜 Checking scripts...');
const requiredScripts = ['build', 'start'];
requiredScripts.forEach(script => {
  if (packageJson.scripts[script]) {
    console.log(`✅ ${script}: ${packageJson.scripts[script]}`);
  } else {
    console.log(`❌ ${script} script missing`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n🎉 Build setup looks good!');
  process.exit(0);
} else {
  console.log('\n❌ Build setup has issues that need to be fixed.');
  process.exit(1);
}