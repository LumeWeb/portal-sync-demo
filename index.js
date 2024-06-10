import { app, BrowserWindow, dialog, ipcMain } from 'electron/main'
import * as path from 'node:path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
// @ts-ignore
import Hyperswarm from 'hyperswarm'
// @ts-ignore
import Corestore from 'corestore'
import Hyperbee from 'hyperbee'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const swarm = new Hyperswarm()
// @ts-ignore
const store = new Corestore(path.join(__dirname, 'data'))
swarm.on('connection', (conn) => store.replicate(conn))

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    win.loadFile(path.join(__dirname, 'dist/index.html'))
    //  win.webContents.openDevTools({mode: 'right'});
}

const handleFileOpen = async (event, id) => {
    const core = store.get({ key: Buffer.from(id, 'hex') })
    const bee = new Hyperbee(core)
    await bee.ready()

    const data = []

    const iter = bee.createRangeIterator()

    for await (const { key, value} of bee.createReadStream()) {
        if (typeof value === 'string') {
            continue
        }

        data.push({ key: key.toString(), value: value.toString() })
    }

    return data
}

app.whenReady().then(() => {
    createWindow()
    ipcMain.handle('loadLog', handleFileOpen)
    ipcMain.handle('dialog', (event, method, params) => {
        dialog[method](...params)
    })
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
