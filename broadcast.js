const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const authFolder = './auth_info';

// 在这里填入要群发的号码
const daftarNomor = [
    '6281234567890',
    '6280987654321',
    '6285555555555'
];

const pesan = '促销活动！点击链接: https://xxx.com';

async function broadcast() {
    const { state } = await useMultiFileAuthState(authFolder);
    
    const sock = makeWASocket({
        auth: state,
        browser: ['Chrome (Linux)', '', '']
    });
    
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log(`\n✅ 登录成功！`);
            console.log(`📨 开始群发到 ${daftarNomor.length} 个号码...\n`);
            
            for (let i = 0; i < daftarNomor.length; i++) {
                const nomor = daftarNomor[i];
                try {
                    await sock.sendMessage(`${nomor}@s.whatsapp.net`, { text: pesan });
                    console.log(`✅ [${i+1}/${daftarNomor.length}] 发送到 ${nomor} 成功`);
                } catch (err) {
                    console.log(`❌ [${i+1}/${daftarNomor.length}] 发送到 ${nomor} 失败: ${err.message}`);
                }
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            
            console.log(`\n✅ 群发完成！`);
            process.exit(0);
        }
    });
}

broadcast();