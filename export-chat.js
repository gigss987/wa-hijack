const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

const authFolder = './auth_info';

async function exportChat() {
    const { state } = await useMultiFileAuthState(authFolder);
    
    const sock = makeWASocket({
        auth: state,
        browser: ['Chrome (Linux)', '', '']
    });
    
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            console.log('\n✅ 登录成功！正在导出聊天记录...\n');
            
            const chats = await sock.groupFetchAllParticipating();
            let output = '========== 聊天记录导出 ==========\n\n';
            
            for (const [id, chat] of Object.entries(chats)) {
                output += `群组/聊天: ${id}\n`;
                output += `名称: ${chat.subject || '私人聊天'}\n`;
                output += `参与者: ${Object.keys(chat.participants || {}).length}人\n`;
                output += `---\n\n`;
            }
            
            fs.writeFileSync('./chat_export.txt', output);
            console.log(`✅ 聊天记录已导出到: chat_export.txt`);
            process.exit(0);
        }
    });
}

exportChat();