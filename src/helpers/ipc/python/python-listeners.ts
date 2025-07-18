import { ipcMain } from "electron";
import { spawn } from "child_process";
import {
  PYTHON_EXECUTE_CHANNEL,
  PYTHON_INSTALL_CHECK_CHANNEL,
} from "./python-channels";

interface PythonResult {
  output: string;
  error: string;
  exitCode: number;
}

export function addPythonEventListeners() {
  ipcMain.handle(PYTHON_EXECUTE_CHANNEL, async (_event, code: string): Promise<PythonResult> => {
    return new Promise((resolve) => {
      // Try different Python commands (python3, python, py)
      const pythonCommands = ['python3', 'python', 'py'];
      let currentIndex = 0;

      const tryPython = () => {
        if (currentIndex >= pythonCommands.length) {
          resolve({
            output: '',
            error: 'Python not found. Please install Python and ensure it\'s in your PATH.',
            exitCode: 1
          });
          return;
        }

        const pythonCmd = pythonCommands[currentIndex];
        const pythonProcess = spawn(pythonCmd, ['-c', code], {
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true
        });

        let output = '';
        let error = '';

        pythonProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          error += data.toString();
        });

        pythonProcess.on('error', () => {
          currentIndex++;
          tryPython();
        });

        pythonProcess.on('close', (code) => {
          resolve({
            output: output.trim(),
            error: error.trim(),
            exitCode: code || 0
          });
        });

        // Set a timeout to prevent hanging
        setTimeout(() => {
          pythonProcess.kill();
          resolve({
            output: output.trim(),
            error: error.trim() || 'Process timeout - execution took too long',
            exitCode: 1
          });
        }, 10000); // 10 second timeout
      };

      tryPython();
    });
  });

  ipcMain.handle(PYTHON_INSTALL_CHECK_CHANNEL, async (): Promise<{ installed: boolean; version?: string }> => {
    return new Promise((resolve) => {
      const pythonCommands = ['python3', 'python', 'py'];
      let currentIndex = 0;

      const checkPython = () => {
        if (currentIndex >= pythonCommands.length) {
          resolve({ installed: false });
          return;
        }

        const pythonCmd = pythonCommands[currentIndex];
        const pythonProcess = spawn(pythonCmd, ['--version'], {
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true
        });

        let output = '';

        pythonProcess.stdout.on('data', (data) => {
          output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
          output += data.toString(); // Python --version sometimes outputs to stderr
        });

        pythonProcess.on('error', () => {
          currentIndex++;
          checkPython();
        });

        pythonProcess.on('close', (code) => {
          if (code === 0 && output.includes('Python')) {
            resolve({ installed: true, version: output.trim() });
          } else {
            currentIndex++;
            checkPython();
          }
        });
      };

      checkPython();
    });
  });
}