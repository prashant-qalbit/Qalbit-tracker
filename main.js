// const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// const FormData = require('form-data');

// let mainWindow;

// function createWindow() {
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false,
//         }
//     });

//     mainWindow.loadFile('index.html');
// }

// app.whenReady().then(() => {
//     createWindow();
//     startCapturingScreenshots();
// });

// function startCapturingScreenshots() {
//     captureAndUploadScreenshot();
//     setInterval(captureAndUploadScreenshot, 1 * 60 * 1000); // 1 minute interval
// }

// async function captureAndUploadScreenshot() {
//     const sources = await desktopCapturer.getSources({ types: ['screen'] });
//     for (const source of sources) {
//         if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
//             const screenshot = source.thumbnail.toPNG();
//             const screenshotPath = path.join(__dirname, 'screenshot.png');
//             fs.writeFileSync(screenshotPath, screenshot);
//             await uploadScreenshot(screenshotPath);
//             break;
//         }
//     }
// }

// async function uploadScreenshot(filePath) {
//     const formData = new FormData();
//     formData.append('screenshot', fs.createReadStream(filePath));

//     try {
//         const response = await axios.post('http://your-laravel-app/upload-screenshot', formData, {
//             headers: {
//                 ...formData.getHeaders()
//             }
//         });
//         console.log('Screenshot uploaded:', response.data);
//     } catch (error) {
//         console.error('Error uploading screenshot:', error);
//     }
// }
// const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// const FormData = require('form-data');

// let mainWindow;

// function createWindow() {
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false,
//         }
//     });

//     mainWindow.loadFile('index.html');
// }

// app.whenReady().then(() => {
//     createWindow();
//     startCapturingScreenshots();
// });

// function startCapturingScreenshots() {
//     captureAndUploadScreenshot();
//     setInterval(captureAndUploadScreenshot, 1 * 60 * 1000); // 1 minute interval
// }

// async function captureAndUploadScreenshot() {
//     const sources = await desktopCapturer.getSources({ types: ['screen'] });
//     for (const source of sources) {
//         if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
//             const screenshotPath = path.join(__dirname, 'screenshot.png');
//             mainWindow.capturePage().then(image => {
//                 fs.writeFile(screenshotPath, image.toPNG(), err => {
//                     if (err) {
//                         console.error('Error saving screenshot:', err);
//                     } else {
//                         console.log('Screenshot saved successfully:', screenshotPath);
//                         uploadScreenshot(screenshotPath);
//                     }
//                 });
//             }).catch(err => {
//                 console.error('Error capturing page:', err);
//             });
//             break;
//         }
//     }
// }

// async function uploadScreenshot(filePath) {
//     const formData = new FormData();
//     formData.append('screenshot', fs.createReadStream(filePath));

//     try {
//         const response = await axios.post('http://your-laravel-app/upload-screenshot', formData, {
//             headers: {
//                 ...formData.getHeaders()
//             }
//         });
//         console.log('Screenshot uploaded:', response.data);
//     } catch (error) {
//         console.error('Error uploading screenshot:', error);
//     }
// }

const { app, BrowserWindow, ipcMain , Notification , Menu,} = require('electron');
const path = require('path');
const screenshot = require('screenshot-desktop');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

let mainWindow;
let screenshotInterval;

function sendNotification(title, body) {
    const notification = new Notification({
        title: title,
        body: body
    });
    notification.show();
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 550,
        height: 600,
        // resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    });

    mainWindow.loadFile('login.html');
}

// const menu = Menu.buildFromTemplate([]);
//     Menu.setApplicationMenu(menu);

    // Prevent the window from entering fullscreen mode

app.whenReady().then(() => {
    createWindow();
});

ipcMain.on('login-success', (event, credentials) => {
    global.userData = credentials;
    mainWindow.loadFile('index.html');
    mainWindow.webContents.once('dom-ready', () => {
        mainWindow.webContents.executeJavaScript(`
            sessionStorage.setItem('userData', JSON.stringify(${JSON.stringify(credentials)}));
            location.reload();
        `);
    });
});

ipcMain.on('start-capturing', (event) => {
    startCapturingScreenshots();
});

ipcMain.on('stop-capturing', (event) => {
    stopCapturingScreenshots();
});

function stopCapturingScreenshots(){
    console.log('Stopping screenshot capture...');
    if (screenshotInterval) {
        clearInterval(screenshotInterval);
        screenshotInterval = null;
    }
}

function startCapturingScreenshots() {
    console.log('Starting screenshot capture...');
    screenshotInterval = setInterval(captureAndUploadScreenshot, 10 * 6 * 1000); // 110 minute interval
}

async function captureAndUploadScreenshot() {
    try {
        console.log('Capturing screenshot...');
        const screenshotDir = path.join(__dirname, 'screenshots', String(global.userData.user.id));
        if (!fs.existsSync(screenshotDir)) {
            console.log('Creating screenshots directory...');
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        const screenshotPath = path.join(screenshotDir, `screenshot-${Date.now()}.png`);

        // let userScreenshotPath = path.join(screenshotPath, toString(global.userData.user.id))
        const img = await screenshot({ format: 'png' });

        fs.writeFile(screenshotPath, img, (err) => {
            if (err) {
                console.error('Error saving screenshot:', err);
            } else {
                console.log('Screenshot saved successfully:', screenshotPath);
                uploadScreenshot(screenshotPath);
            }
        });
    } catch (error) {
        console.error('Error capturing screenshot:', error);
    }
}

async function uploadScreenshot(filePath) {
    const formData = new FormData();
    formData.append('screenshot', fs.createReadStream(filePath));
    formData.append('userId', global.userData.user.id);
    try {
        console.log('Uploading screenshot...');
        // const csrfToken = document.head.querySelector('meta[name="csrf-token"]').content;
        const response = await axios.post('http://127.0.0.1:8000/upload-screenshot', formData,  {
            headers: {
                // 'X-CSRF-TOKEN': csrfToken,
                ...formData.getHeaders(),

            }
        });
        console.log('Screenshot uploaded:', response.data);
    } catch (error) {
        console.error('Error uploading screenshot:', error);
    }
}


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

// app.on('ready', () => {
//     // Send a notification when the app is ready
//     sendNotification('App Ready', 'Your Electron app is ready!');
// });

// app.on('before-quit', ()=>{
//     sendNotification('App Quitting', 'Your Electron app is about to quit!');
// })


// const { app, BrowserWindow, desktopCapturer } = require('electron');
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// const FormData = require('form-data');

// let mainWindow;

// function createWindow() {
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false,
//         }
//     });

//     mainWindow.loadFile('index.html');
// }

// app.whenReady().then(() => {
//     createWindow();
//     startCapturingScreenshots();
//     app.on('window-all-closed', (event) => {
//         event.preventDefault();
//     });
// });

// function startCapturingScreenshots() {
//     captureAndUploadScreenshot();
//     setInterval(captureAndUploadScreenshot, 1 * 60 * 1000); // 1 minute interval
// }

// async function captureAndUploadScreenshot() {
//     const screenshotDir = path.join(__dirname, 'screenshots');
//     if (!fs.existsSync(screenshotDir)) {
//         fs.mkdirSync(screenshotDir);
//     }

//     const sources = await desktopCapturer.getSources({ types: ['screen'] });
//     for (const source of sources) {
//         if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
//             const screenshotPath = path.join(screenshotDir, `screenshot-${Date.now()}.png`);
            
//             const thumbnail = source.thumbnail.toPNG();
//             fs.writeFile(screenshotPath, thumbnail, (err) => {
//                 if (err) {
//                     console.error('Error saving screenshot:', err);
//                 } else {
//                     console.log('Screenshot saved successfully:', screenshotPath);
//                     uploadScreenshot(screenshotPath);
//                 }
//             });
//             break;
//         }
//     }
// }

// async function uploadScreenshot(filePath) {
//     const formData = new FormData();
//     formData.append('screenshot', fs.createReadStream(filePath));

//     try {
//         const response = await axios.post('http://your-laravel-app/upload-screenshot', formData, {
//             headers: {
//                 ...formData.getHeaders()
//             }
//         });
//         console.log('Screenshot uploaded:', response.data);
//     } catch (error) {
//         console.error('Error uploading screenshot:', error);
//     }
// }

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });

// app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//         createWindow();
//     }
// });


// const { app, BrowserWindow, desktopCapturer } = require('electron');
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// const FormData = require('form-data');

// let mainWindow;

// function createWindow() {
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false,
            
//         }
//     });

//     mainWindow.loadFile('index.html');
// }

// app.whenReady().then(() => {
//     createWindow();
//     startCapturingScreenshots();
// });

// function startCapturingScreenshots() {
//     captureAndUploadScreenshot();
//     setInterval(captureAndUploadScreenshot, 1 * 60 * 1000); // 1 minute interval
// }

// async function captureAndUploadScreenshot() {
//     const screenshotDir = path.join(__dirname, 'screenshots');
//     if (!fs.existsSync(screenshotDir)) {
//         fs.mkdirSync(screenshotDir);
//     }

//     const sources = await desktopCapturer.getSources({ types: ['screen'] });
//     for (const source of sources) {
//         if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
//             const screenshotPath = path.join(screenshotDir, `screenshot-${Date.now()}.png`);
            
//             const thumbnail = source.thumbnail.toPNG();
//             fs.writeFile(screenshotPath, thumbnail, (err) => {
//                 if (err) {
//                     console.error('Error saving screenshot:', err);
//                 } else {
//                     console.log('Screenshot saved successfully:', screenshotPath);
//                     uploadScreenshot(screenshotPath);
//                 }
//             });
//             break;
//         }
//     }
// }

// async function uploadScreenshot(filePath) {
//     const formData = new FormData();
//     formData.append('screenshot', fs.createReadStream(filePath));

//     // try {
//     //     const response = await axios.post('http://your-laravel-app/upload-screenshot', formData, {
//     //         headers: {
//     //             ...formData.getHeaders()
//     //         }
//     //     });
//     //     console.log('Screenshot uploaded:', response.data);
//     // } catch (error) {
//     //     console.error('Error uploading screenshot:', error);
//     // }
// }

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });

// app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//         createWindow();
//     }
// });

// const { app, BrowserWindow, desktopCapturer } = require('electron');
// const axios = require('axios');
// const fs = require('fs');
// const path = require('path');
// const FormData = require('form-data');

// let mainWindow;

// function createWindow() {
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             nodeIntegration: true,
//             contextIsolation: false,
//         }
//     });

//     mainWindow.loadFile('index.html');
// }

// app.whenReady().then(() => {
//     createWindow();
//     startCapturingScreenshots();
// });

// function startCapturingScreenshots() {
//     setInterval(captureAndUploadScreenshot, 1 * 60 * 1000); // 1 minute interval
// }

// async function captureAndUploadScreenshot() {
//     try {
//         const sources = await desktopCapturer.getSources({ types: ['screen'] });
//         for (const source of sources) {
//             if (source.name === 'Entire Screen' || source.name === 'Screen 1') {
//                 const screenshotDir = path.join(app.getPath('userData'), 'screenshots');
//                 if (!fs.existsSync(screenshotDir)) {
//                     fs.mkdirSync(screenshotDir, { recursive: true });
//                 }

//                 const screenshotPath = path.join(screenshotDir, `screenshot-${Date.now()}.png`);
//                 const thumbnail = source.thumbnail.toPNG();
//                 fs.writeFileSync(screenshotPath, thumbnail);
//                 console.log('Screenshot saved successfully:', screenshotPath);
//                 await uploadScreenshot(screenshotPath);
//                 break;
//             }
//         }
//     } catch (error) {
//         console.error('Error capturing screenshot:', error);
//     }
// }

// async function uploadScreenshot(filePath) {
//     const formData = new FormData();
//     formData.append('screenshot', fs.createReadStream(filePath));

//     try {
//         const response = await axios.post('http://your-laravel-app/upload-screenshot', formData, {
//             headers: {
//                 ...formData.getHeaders()
//             }
//         });
//         console.log('Screenshot uploaded:', response.data);
//     } catch (error) {
//         console.error('Error uploading screenshot:', error);
//     }
// }

// app.on('window-all-closed', () => {
//     if (process.platform !== 'darwin') {
//         app.quit();
//     }
// });

// app.on('activate', () => {
//     if (BrowserWindow.getAllWindows().length === 0) {
//         createWindow();
//     }
// });

