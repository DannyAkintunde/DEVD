const { cmd, commands, categories } = require('../command');
const config = require('../config')
const { randomInt } = require('../lib/functions')


const defualtBtn = [{
    buttonId: `${config.PREFIX}sc`,
    buttonText: {
        displayText: 'BOT SCRIPT'
    },
    type: 1
  },{
    buttonId: `${config.PREFIX}ping`,
    buttonText: {
        displayText: 'CHECK PING'
    },
    type: 1
  }]

function genMenu(category,pettern,images,react="⬇👨‍💻",buttons=defualtBtn) {
  cmd(
    {
    pattern: pettern,
    react: react,
    dontAddCommandList: true,
    filename: __filename
  },
    async(conn, mek, m,{from, prefix, l, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply}) => {
      try{
      let menuc = `*● ══════════════ ●*
      
*${category.toLocaleUpperCase()} COMMANDS MENU*\n\n`
    console.log(`generating ${pattern} ${category} ${images} ${react} ${buttons} `)
      for (let i=0;i<commands.length;i++) { 
      if(commands[i].category === category){
        if(!commands[i].dontAddCommandList){
      menuc += `*📍➣Command :* ${commands[i].pattern}
      *📃➣Desc :* ${commands[i].desc}
      *⌛➣Use:* ${commands[i].use}\n\n`
      }}};
      
        let buttonMessaged = {
          image: { url: images[randomInt(0,--images.length)] },
          caption: menuc,
          footer: config.FOOTER,
          headerType: 4,
          buttons: buttons
        };
        return await conn.buttonMessage(from, buttonMessaged, mek);
      } catch (e) {
        reply('*ERROR !!*')
        l(e)
      }
    }
  )
}

// info

const catInfo = {
  DOWNLOAD: {
    pattern: 'downmenu',
    images: ['https://telegra.ph/file/24b19e11c51c3b8dde0a1.jpg']
  },
  SEARCH: {
    images: ['https://telegra.ph/file/0daa736951473c130e73f.jpg']
  },
  CONVERT: {
    images: ['https://telegra.ph/file/0daa736951473c130e73f.jpg']
  },
  LOGO: {
    images: ['https://telegra.ph/file/5e61a90b90c6307a0757e.jpg']
  },
  OWNER: {
    images: ['https://telegra.ph/file/787b6b23e75057e08e69b.jpg']
  },
  ADMIN: {
    images: ['https://telegra.ph/file/7f48f7bbbe85de4532d71.jpg']
  },
  OTHER: {
    images: ['https://telegra.ph/file/01994d1adb2fe606c3dd2.jp']
  }
}

// gen Menus
function init(conn){
console.log('catigories: ', JSON.stringify(categories))
for (let i=0; i < categories.length; i++) {
  let pattern = catInfo[categories[i].toUpperCase()]?.pattern ? catInfo[categories[i].toUpperCase()]?.pattern : categories[i] + "menu" ;
  let images = catInfo[categories[i].toUpperCase()]?.images ? catInfo[categories[i].toUpperCase()]?.images : [config.LOGO] ;
  genMenu(categories[i], pattern, images, catInfo[categories[i].toUpperCase()]?.react,catInfo[categories[i].toUpperCase()]?.buttons);
}
      }

moudule.exports{
    init
}
