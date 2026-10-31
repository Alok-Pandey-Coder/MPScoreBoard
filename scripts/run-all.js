import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Starting Mera MP Full-Stack Environment (Frontend + Backend)...\n');

// 1. Start Backend API Server
const backend = spawn('node', ['server/server.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

// 2. Start Frontend Vite Dev Server
const frontend = spawn('npm', ['--prefix', 'frontend', 'run', 'dev', '--', '--host'], {
  cwd: rootDir,
  stdio: 'inherit',
  shell: true,
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  backend.kill();
  frontend.kill();
  process.exit(0);
});

