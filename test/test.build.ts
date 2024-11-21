import child_process from 'child_process';
import fs from 'fs';
import net from 'net';
import path from 'path';

const PORT = 3001;
const currentRepoPath = process.cwd();
const newRepoPath = path.resolve(currentRepoPath, '..', `${path.basename(currentRepoPath)}-test`);

function debug(message: string) {
  process.stdout.write(`🤖 \x1b[38;2;25;118;210m${message}...\x1b[0m\n`);
}

function errorLog(message: string) {
  process.stdout.write(`\x1b[38;2;220;0;78m${message}\x1b[0m\n`);
}

async function execCommand(command: string, options = {}) {
  return new Promise<void>((resolve, reject) => {
    const proc = child_process.spawn(command, { ...options, shell: true, stdio: 'inherit' });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command "${command}" failed with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

async function setup() {
  try {
    const currentBranch = child_process.execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    debug(`Current branch: ${currentBranch}`);

    if (fs.existsSync(newRepoPath)) {
      debug(`Removing existing directory: ${newRepoPath}`);
      child_process.execSync(`npx kill-port 3001`, { stdio: 'inherit' });
      fs.rmSync(newRepoPath, { recursive: true });
    }

    debug(`Cloning repository into: ${newRepoPath}`);
    await execCommand(`git clone --branch ${currentBranch} --single-branch ${currentRepoPath} ${newRepoPath}`);

    process.chdir(newRepoPath);

    debug('Removing origin remote');
    await execCommand('git remote remove origin');

    debug('Running npm ci');
    await execCommand('npm ci');

    debug('Running npm run build');
    await execCommand('npm run build');

    debug('Starting server');
    startServer();
  } catch (error) {
    errorLog(`Error during setup: ${error.message}`);
    process.exit(1);
  }
}

function waitForPort(port: number, timeout = 30000) {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const client = new net.Socket();
      client
        .connect(port, '127.0.0.1', () => {
          clearInterval(interval);
          client.destroy();
          resolve();
        })
        .on('error', () => {
          client.destroy();
          if (Date.now() - startTime > timeout) {
            clearInterval(interval);
            reject(new Error(`Port ${port} not available after ${timeout}ms`));
          }
        });
    }, 500);
  });
}

function startServer() {
  const startProcess = child_process.spawn('npm', ['start'], {
    stdio: 'inherit',
    shell: true,
    detached: true,
  });

  startProcess.unref(); // 分离进程，确保主进程可退出

  debug('Waiting for server to be ready');
  waitForPort(PORT)
    .then(() => {
      debug(`Server is running. Opening browser at http://localhost:${PORT}/`);
      child_process.exec('start http://localhost:3001/');
    })
    .catch((error) => {
      errorLog(`Failed to start server: ${error.message}`);
      process.exit(1);
    });
}

setup();
