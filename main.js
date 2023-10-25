const {app, BrowserWindow, session, ipcMain, webContents, dialog} = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');

let mainWindow;
let isFileSaved = false; // Initialize as saved

function saveFileQuietly(data, filename) {
  const filePath = path.join(app.getPath('userData'), filename);

  fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.error('Error saving file:', err);
    } else {
      console.log('File saved successfully:', filePath);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    fullscreen: false,
    autohidemenubar: true,
    frame: true,
    preload: 'preload.js',
    icon: '/dn-lte-ico.png',
  webPreferences: {
  nodeIntegration: true
  }
  });
  mainWindow.maximize();
// mainWindow.removeMenu();
  // Load your HTML file or app URL
var openedOffline = false;
if (process.argv.length >= 2) {
    const filePath = process.argv[1];
     openedOffline = true;
    // Handle the file path here
    // You can use 'filePath' to do something with the file
    console.log('Opened file Win:', filePath);
    saveFileQuietly(filePath, 'opened.txt');
    mainWindow.loadFile('index.html');
  }
if(openedOffline == false) {

  mainWindow.loadFile('index.html');
}
ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})

ipcMain.handle('dark-mode:system', () => {
  nativeTheme.themeSource = 'system'
})
ipcMain.on('file-unsaved', (event) => {
    isFileSaved = false;
  });
  ipcMain.on('file-saved', (event) => {
    isFileSaved = true;
  });
mainWindow.on('close', (event) => {
    if (!isFileSaved) {
      const choice = dialog.showMessageBoxSync(mainWindow, {
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Do you want to save the changes before closing?',
      });

      if (choice === 0) {
        // User clicked "Yes," save the changes and close the app
        // Implement the saving logic here
        mainWindow.webContents.executeJavaScript('saveState(); ');

        event.preventDefault();

      } else if (choice === 1) {
        // User clicked "No," close the app without saving
        mainWindow = null;

      } else {
        // User canceled the dialog, prevent the app from closing
        event.preventDefault();
      }
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
}); 