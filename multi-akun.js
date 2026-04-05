const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

const akunList = [
    { nama: '账号1', folder: './auth_akun1' },
    { nama: '账号2', folder: './auth_akun2' }
];

async function startAkun(nama, folder) {
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    
    const { state, saveCreds } = await useMultiFileAuthState(folder);
    
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true,
        browser: ['Chrome (Linux)', '', '']
    });
    
    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log(`✅ ${nama} 登录成功！`);
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
}

for (const akun of akunList) {
    startAkun(akun.nama, akun.folder);
    console.log(`📱 启动 ${akun.nama}...`);
}