const { app, BrowserWindow, ipcMain, Menu, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const dataFolder = path.join(app.getPath('appData'), 'Fallout Account Manager', 'Data');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, './assets/images/logo.ico'),
    });

    if (require('electron-squirrel-startup')) app.quit();

    Menu.setApplicationMenu(null);
    win.loadFile(path.join(__dirname, 'index.html'));
    win.on('ready-to-show', win.show);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

ipcMain.handle('load-accounts', async () => {
    try {
        const exampleData = {
            characterInventories: {
                "Example Account": {
                    playerInventory: [],
                    stashInventory: [],
                    AccountInfoData: { name: "Example" },
                    CharacterInfoData: { level: 20, name: "Hi" }
                }
            }
        };

        if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder, { recursive: true });

        const jsonFiles = fs.readdirSync(dataFolder).filter(file => file.endsWith('.json'));

        if (jsonFiles.length === 0) {
            fs.writeFileSync(path.join(dataFolder, 'example.json'), JSON.stringify(exampleData, null, 2));
        }

        let allData = {};
        jsonFiles.forEach(file => {
            try {
                const fileData = JSON.parse(fs.readFileSync(path.join(dataFolder, file), 'utf-8'));
                if (fileData.characterInventories) allData = { ...allData, ...fileData.characterInventories };
            } catch (err) {
                console.error(`Error reading or parsing ${file}:`, err);
            }
        });

        return { characterInventories: allData };
    } catch (error) {
        console.error("Failed to load accounts:", error);
        throw error;
    }
});

ipcMain.handle('folder-open', () => {
    if (!fs.existsSync(dataFolder)) fs.mkdirSync(dataFolder, { recursive: true });
    return shell.openPath(dataFolder);
});

ipcMain.handle('save-file', async (event, filename, data) => {
    try {
        await fs.promises.writeFile(path.join(dataFolder, filename), data);
        return 'File saved successfully';
    } catch (error) {
        throw new Error('Failed to save file: ' + error.message);
    }
});