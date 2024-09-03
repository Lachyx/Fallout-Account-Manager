const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs')

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, './preload.js'),
            nodeIntegration: false, 
        },
        icon: path.join(__dirname, './assets/images/logo.ico'),
    });
    Menu.setApplicationMenu(null)
    win.loadFile('src/html/index.html');
    win.on('ready-to-show', win.show)
    win.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

const exampleAccounts = {
  "This can be anyname": {
    "playerInventory": [],
    "stashInventory": [],
    "AccountInfoData": { "name": "Example" },
    "CharacterInfoData": { "level": 20, "name": "Hi" }
  }
};

ipcMain.handle('load-accounts', async () => {
  try {
      const dataFolderPath = path.join(app.getPath('appData'), 'fallout-account-manager', 'Data');

      if (!fs.existsSync(dataFolderPath)) {
          fs.mkdirSync(dataFolderPath, { recursive: true });
      }

      const jsonFiles = fs.readdirSync(dataFolderPath).filter(file => file.endsWith('.json'));

      if (jsonFiles.length === 0) {
          const filePath = path.join(dataFolderPath, 'example.json');
          fs.writeFileSync(filePath, JSON.stringify(exampleAccounts, null, 2));
          console.log("No JSON files found. Created example.json");
      }

      let allData = {};
      jsonFiles.forEach(file => {
          try {
              const filePath = path.join(dataFolderPath, file);
              const fileData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
              
              if (fileData.characterInventories) {
                  allData = { ...allData, ...fileData.characterInventories };
              } else {
                  console.error(`No characterInventories found in ${file}`);
              }
              
              console.log(`Loaded data from ${file}:`, fileData);
          } catch (err) {
              console.error(`Error reading or parsing file ${file}:`, err);
          }
      });

      return { characterInventories: allData };
  } catch (error) {
      console.error("Failed to load accounts:", error);
      throw error; 
  }
});

ipcMain.handle('folder-open', () => {
  const dataFolderPath = path.join(require('electron').app.getPath('appData'), 'fallout-account-manager', 'Data');
  shell.openPath(dataFolderPath);
})

ipcMain.handle('save-file', async (event, filename, data) => {
    const dataDir = path.join(require('electron').app.getPath('appData'), 'fallout-account-manager', 'Data');
    const filePath = path.join(dataDir, filename);
    try {
        await fs.promises.writeFile(filePath, data);
        return 'File saved successfully';
    } catch (error) {
        throw new Error('Failed to save file: ' + error.message);
    }
});