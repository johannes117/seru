import {
  PYTHON_EXECUTE_CHANNEL,
  PYTHON_INSTALL_CHECK_CHANNEL,
} from "./python-channels";

export function exposePythonContext() {
  const { contextBridge, ipcRenderer } = window.require("electron");
  contextBridge.exposeInMainWorld("python", {
    execute: (code: string) => ipcRenderer.invoke(PYTHON_EXECUTE_CHANNEL, code),
    checkInstall: () => ipcRenderer.invoke(PYTHON_INSTALL_CHECK_CHANNEL),
  });
}