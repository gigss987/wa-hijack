const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

let currentQR = null;
let isReady = false;
const authFolder = './auth_info';

if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true });
}

app.get('/', (req, res) => {
    if (isReady) {
        res.send(`
            <html>
            <head><title>WhatsApp网页版</title></head>
            <body style="text-align:center;padding:50px;font-family:Arial;">
                <h2 style="color:green;">✅ Token抓取成功！</h2>
                <p>文件已保存: ${authFolder}/creds.json</p>
                <p>现在可以关闭此页面</p>
            </body>
            </html>
        `);
    } else if (currentQR) {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(currentQR)}`;
        res.send(`
            <html>
            <head><title>WhatsApp网页版</title></head>
            <body style="text-align:center;padding:50px;font-family:Arial;">
                <h2>扫描二维码</h2>
                <img src="${qrUrl}" style="border:2px solid #ddd;border-radius:10px;">
                <p>1. 打开WhatsApp手机版<br>2. 点击 ⋮ → 已关联设备<br>3. 点击 关联设备<br>4. 扫描上方二维码</p>
            </body>
            </html>
        `);
    } else {
        res.send('<h2>⏳ 等待二维码...</h2><meta http-equiv="refresh" content="3">');
    }
});

app.get('/get-qr', (req, res) => {
    if (currentQR) {
        res.json({ qr: currentQR });
    } else {
        res.json({ qr: null });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n🌐 浏览器打开: http://localhost:${PORT}`);
});

async function startWhatsApp() {
    const { version } = await fetchLatestBaileysVersion();
    console.log(`📱 Baileys版本: ${version}`);
    
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Chrome (Linux)', '', ''],
        version: version
    });
    
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            currentQR = qr;
            console.log('\n========== 扫描下方二维码 ==========\n');
            qrcode.generate(qr, { small: true });
            console.log('\n=====================================\n');
        }
        
        if (connection === 'open') {
            isReady = true;
            console.log('\n✅ Token抓取成功！');
            console.log(`📁 保存位置: ${authFolder}/creds.json\n`);
        }
        
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) {
                console.log('🔄 连接断开，5秒后重连...');
                setTimeout(startWhatsApp, 5000);
            }
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
}

startWhatsApp();