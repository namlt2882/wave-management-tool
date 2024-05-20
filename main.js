import { menuTemplate } from "./src/common/menu-template.js";
import { app, BrowserWindow, Menu } from "electron";
import url, { fileURLToPath } from "url";
import path from "path";
import { setup } from "./src/home-screen/load-address-status.bg.js";

let window;

function createWindow() {
  window = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  window.webContents.openDevTools();
  setup();
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  window.loadURL(
    url.format({
      pathname: path.join(__dirname, "./src/home-screen/home.html"),
      protocol: "file:",
      slashes: true,
      preload: path.join(__dirname, "./src/home-screen/index.js"),
    })
  );
  //set menu
  const menu = Menu.buildFromTemplate(menuTemplate(window));
  Menu.setApplicationMenu(menu);
}
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
