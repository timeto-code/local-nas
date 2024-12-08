import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

const currentRepoPath = process.cwd();
const newRepoPath = path.resolve(currentRepoPath, '..', `${path.basename(currentRepoPath)}-test`);

function debug(message: string) {
  process.stdout.write(`🤖 \x1b[38;2;25;118;210m${message}...\x1b[0m\n`);
}

function errorLog(message: string) {
  process.stdout.write(`👾 \x1b[38;2;220;0;78m${message}\x1b[0m\n`);
}

function clear() {
  try {
    if (fs.existsSync(newRepoPath)) {
      debug(`Removing existing directory: ${newRepoPath}`);
      child_process.execSync(`npx kill-port 3001`, { stdio: 'inherit' });
      fs.rmSync(newRepoPath, { recursive: true });
      debug('Directory removed');
    } else {
      debug('Directory does not exist');
    }
  } catch (error) {
    errorLog(`Error during clear: ${error.message}`);
  }
}

clear();
