#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting InterviewAI Development Environment...\n');

// Start the backend server
console.log('📡 Starting backend server on port 3001...');
const backend = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('🌐 Starting frontend server on port 5173...');
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    cwd: __dirname,
    shell: true
  });

  frontend.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    backend.kill();
  });
}, 2000);

backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development servers...');
  backend.kill();
  process.exit(0);
});

console.log('\n✨ Development servers starting...');
console.log('📱 Frontend: http://localhost:5173');
console.log('🔧 Backend: http://localhost:3001');
console.log('\n💡 Press Ctrl+C to stop both servers\n');