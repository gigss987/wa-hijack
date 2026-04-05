const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const authFolder = './auth_info';
const nomorTujuan = process.argv[2] || '6281234567890';
const pesan = process.argv[3] || '测试消息';

async function kirimPesan() {
    const { state } = await useMultiFileAuthState(authFolder);
    
    const sock = makeWASocket({
        auth: state,
        browser: ['Chrome (Linux)', '', '']
    });
    
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log(`\n✅ 登录成功！`);
            console.log(`📨 发送消息到: ${nomorTujuan}\n`);
            
            await sock.sendMessage(`${nomorTujuan}@s.whatsapp.net`, { text: pesan });
            console.log(`✅ 消息已发送！`);
            process.exit(0);
        }
    });
}

kirimPesan();