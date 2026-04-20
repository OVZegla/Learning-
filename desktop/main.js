const { app, BrowserWindow, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const os = require("os");
const http = require("http");
const crypto = require("crypto");
const { spawn } = require("child_process");

const BACKEND_PORT = 4000;
const FRONTEND_PORT = 3000;
const BACKEND_URL = `http://127.0.0.1:${BACKEND_PORT}`;
const FRONTEND_URL = `http://127.0.0.1:${FRONTEND_PORT}`;

let backendProc = null;
let frontendProc = null;
let mainWindow = null;
let logStream = null;

function getResourcePath(...parts) {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, ...parts);
  }
  return path.join(__dirname, "..", ...parts);
}

function ensureLogStream() {
  if (logStream) return logStream;
  const logDir = app.getPath("userData");
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (_) {}
  logStream = fs.createWriteStream(path.join(logDir, "learning-desktop.log"), { flags: "a" });
  logStream.write(`\n=== ${new Date().toISOString()} launch ===\n`);
  return logStream;
}

function log(line) {
  const msg = `[desktop] ${line}\n`;
  process.stdout.write(msg);
  ensureLogStream().write(msg);
}

function pipeChild(name, child) {
  const stream = ensureLogStream();
  child.stdout.on("data", (chunk) => {
    const text = chunk.toString();
    process.stdout.write(`[${name}] ${text}`);
    stream.write(`[${name}] ${text}`);
  });
  child.stderr.on("data", (chunk) => {
    const text = chunk.toString();
    process.stderr.write(`[${name}] ${text}`);
    stream.write(`[${name}] ${text}`);
  });
}

function getOrCreateSecret() {
  const secretFile = path.join(app.getPath("userData"), "jwt.secret");
  try {
    if (fs.existsSync(secretFile)) {
      return fs.readFileSync(secretFile, "utf8").trim();
    }
  } catch (_) {}
  const value = crypto.randomBytes(48).toString("hex");
  try {
    fs.mkdirSync(path.dirname(secretFile), { recursive: true });
    fs.writeFileSync(secretFile, value, { mode: 0o600 });
  } catch (e) {
    log(`could not persist jwt secret: ${e.message}`);
  }
  return value;
}

function prepareDatabase() {
  const userData = app.getPath("userData");
  fs.mkdirSync(userData, { recursive: true });
  const dbFile = path.join(userData, "learning.db");
  const template = getResourcePath("backend", "data", "learning.db");

  if (!fs.existsSync(dbFile) && fs.existsSync(template)) {
    fs.copyFileSync(template, dbFile);
    log(`copied seed database to ${dbFile}`);
  }
  return dbFile;
}

function startBackend(dbFile) {
  const backendDir = getResourcePath("backend");
  const entry = path.join(backendDir, "dist", "main.js");
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    NODE_ENV: "production",
    PORT: String(BACKEND_PORT),
    DATABASE_URL: `file:${dbFile.replace(/\\/g, "/")}`,
    JWT_SECRET: getOrCreateSecret(),
    JWT_EXPIRES_IN: "15m",
    JWT_REFRESH_EXPIRES_IN: "7d",
    CORS_ORIGIN: FRONTEND_URL,
  };
  log(`starting backend: ${entry}`);
  backendProc = spawn(process.execPath, [entry], {
    env,
    cwd: backendDir,
    stdio: ["ignore", "pipe", "pipe"],
  });
  pipeChild("backend", backendProc);
  backendProc.on("exit", (code, signal) => {
    log(`backend exited code=${code} signal=${signal}`);
    backendProc = null;
  });
}

function startFrontend() {
  const frontendDir = getResourcePath("frontend");
  const entry = path.join(frontendDir, "server.js");
  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    NODE_ENV: "production",
    PORT: String(FRONTEND_PORT),
    HOSTNAME: "127.0.0.1",
    API_INTERNAL_URL: BACKEND_URL,
  };
  log(`starting frontend: ${entry}`);
  frontendProc = spawn(process.execPath, [entry], {
    env,
    cwd: frontendDir,
    stdio: ["ignore", "pipe", "pipe"],
  });
  pipeChild("frontend", frontendProc);
  frontendProc.on("exit", (code, signal) => {
    log(`frontend exited code=${code} signal=${signal}`);
    frontendProc = null;
  });
}

function pingOnce(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      res.resume();
      resolve(res.statusCode && res.statusCode < 500);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function waitFor(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await pingOnce(url)) return true;
    await new Promise((r) => setTimeout(r, 400));
  }
  return false;
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: "Learning+",
    backgroundColor: "#0f172a",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.once("ready-to-show", () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const loadingHtml = `data:text/html;charset=utf-8,${encodeURIComponent(
    `<!doctype html><html><head><meta charset="utf-8"><title>Learning+</title>
    <style>
      html,body{margin:0;height:100%;background:#0f172a;color:#e2e8f0;font-family:system-ui,Segoe UI,Helvetica,Arial,sans-serif}
      .wrap{height:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:16px}
      .spinner{width:40px;height:40px;border:4px solid #334155;border-top-color:#38bdf8;border-radius:50%;animation:spin 1s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}
      small{color:#94a3b8}
    </style></head><body><div class="wrap"><div class="spinner"></div><div>Demarrage de Learning+...</div><small>Premiere ouverture : quelques secondes</small></div></body></html>`,
  )}`;
  mainWindow.loadURL(loadingHtml);

  const ready = await waitFor(FRONTEND_URL, 45000);
  if (!ready) {
    dialog.showErrorBox(
      "Learning+",
      "Le serveur local n'a pas demarre dans les temps. Consultez le journal : " +
        path.join(app.getPath("userData"), "learning-desktop.log"),
    );
    app.quit();
    return;
  }
  mainWindow.loadURL(FRONTEND_URL);
}

function killChildren() {
  for (const child of [backendProc, frontendProc]) {
    if (!child) continue;
    try {
      child.kill();
    } catch (_) {}
  }
  backendProc = null;
  frontendProc = null;
}

app.on("window-all-closed", () => {
  killChildren();
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  killChildren();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.whenReady().then(() => {
  try {
    ensureLogStream();
    log(`platform=${process.platform} arch=${process.arch} node=${process.versions.node} electron=${process.versions.electron}`);
    const dbFile = prepareDatabase();
    startBackend(dbFile);
    startFrontend();
    return createWindow();
  } catch (e) {
    log(`fatal: ${e.stack || e.message}`);
    dialog.showErrorBox("Learning+", String(e.message || e));
    app.quit();
  }
});
