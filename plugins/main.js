const config = require("../config");
const os = require("os");
const os = require('os')
const { exec } = require('child_process')
const { cmd, commands, categories } = require("../command");
const {
    getBuffer,
    getGroupAdmins,
    getRandom,
    h2k,
    isUrl,
    Json,
    runtime,
    sleep,
    fetchJson,
    randomInt,
    randChoice
} = require("../lib/functions");
const { convertTemplateToES6 } = require("../lib/templar");

cmd(
    {
        pattern: "alive",
        react: "👨‍💻",
        alias: ["online"],
        desc: "Check bot online or no.",
        category: "main",
        use: ".alive",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            prefix,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            var msg = mek;
            if (os.hostname().length == 12) hostname = "replit";
            else if (os.hostname().length == 36) hostname = "heroku";
            else if (os.hostname().length == 8) hostname = "koyeb";
            else hostname = os.hostname();
            let monspace = "```";
            let monspacenew = "`";
            if (config.ALIVE === "default") {
                const sections = [
                    {
                        title: "",
                        rows: [
                            {
                                title: "1",
                                rowId: prefix + "menu",
                                description: "COMMANDS MENU"
                            },
                            {
                                title: "2",
                                rowId: prefix + "ping",
                                description: "CHECK SPEED"
                            }
                        ]
                    }
                ];
                const listMessage = {
                    caption: `${monspace}👋 Hey ${pushname} I'm alive now${monspace}
    
*🚀Version:* ${require("../package.json").version}
*⌛Memory:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
                        2
                    )}MB / ${Math.round(require("os").totalmem / 1024 / 1024)}MB
*🕒Runtime:* ${runtime(process.uptime())}
*📍Platform:* ${hostname}

                    `,
                    image: { url: config.LOGO },
                    footer: config.FOOTER,
                    buttonText: "🔢 Reply below number,",
                    sections,
                    contextInfo: {
                        externalAdReply: {
                            title: `「 ${config.BOT} 」`,
                            body: "🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲",
                            mediaType: 1,
                            sourceUrl: global.link,
                            thumbnailUrl: config.LOGO,
                            renderLargerThumbnail: false,
                            showAdAttribution: true
                        }
                    }
                };

                return await conn.replyList(from, listMessage, { quoted: msg });
            } else {
                const sections = [
                    {
                        title: "",
                        rows: [
                            {
                                title: "1",
                                rowId: prefix + "menu",
                                description: "COMMANDS MENU"
                            },
                            {
                                title: "2",
                                rowId: prefix + "ping",
                                description: "CHECK SPEED"
                            }
                        ]
                    }
                ];
                const listMessage = {
                    caption: config.ALIVE,
                    image: { url: config.LOGO },
                    footer: config.FOOTER,
                    buttonText: "🔢 Reply below number,",
                    sections,
                    contextInfo: {
                        externalAdReply: {
                            title: `「 ${config.BOT} 」`,
                            body: "🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲",
                            mediaType: 1,
                            sourceUrl: global.link,
                            thumbnailUrl: config.LOGO,
                            renderLargerThumbnail: false,
                            showAdAttribution: true
                        }
                    }
                };

                return await conn.replyList(from, listMessage, { quoted: msg });
            }
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "ping",
        react: "📟",
        alias: ["speed"],
        desc: "Check bot's ping",
        category: "main",
        use: ".ping",
        filename: __filename
    },
    async (
        conn,
        mek,
        m,
        {
            from,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            var inital = new Date().getTime();
            let ping = await conn.sendMessage(
                from,
                { text: "```Pinging```" },
                { quoted: mek }
            );
            var final = new Date().getTime();
            return await conn.edite(
                ping,
                "*Pong*\n *" + (final - inital) + " ms* "
            );
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd(
    {
        pattern: "runtime",
        alias: ["uptime"],
        desc: "to check how long the bot have been running",
        category: "main",
        react: "🤖",
        filename: __filename
    },
    async (conn, mek, m, options) => {
        const runtimetext = `🤖 *Bot Have Been Running For ${runtime(
            process.uptime()
        )}* 🤖`;
        conn.replyad(
            runtimetext,
            (title = `${config.BOT}`),
            (body = "Runtime stat")
        );
    }
);

cmd(
    {
        pattern: "menu",
        react: "👨‍💻",
        alias: ["panel", "commands"],
        desc: "Get bot's command list.",
        category: "main",
        use: ".menu",
        filename: __filename
    },
    async (
        conn,
        msg,
        m,
        {
            from,
            prefix,
            l,
            quoted,
            body,
            isCmd,
            command,
            args,
            q,
            isGroup,
            sender,
            senderNumber,
            botNumber2,
            botNumber,
            pushname,
            isMe,
            isOwner,
            groupMetadata,
            groupName,
            participants,
            groupAdmins,
            isBotAdmins,
            isAdmins,
            reply
        }
    ) => {
        try {
            if (os.hostname().length == 12) hostname = "replit";
            else if (os.hostname().length == 36) hostname = "heroku";
            else if (os.hostname().length == 8) hostname = "koyeb";
            else hostname = os.hostname();
            let monspace = "```";
            let monspacenew = "`";
            const sections = [
                {
                    title: "Select Menu",
                    rows: []
                }
            ];
            const menuCategories = categories.filter(
                category => category.toLowerCase() != "misc"
            );
            for (let i = 0; i < menuCategories.length; i++) {
                if (menuCategories[i].toLowerCase() === "misc") continue;
                let cat = global.THEME.menus[menuCategories[i].toUpperCase()];
                let command =
                    cat?.pattern || menuCategories[i].toLowerCase() + "menu";
                let row = {
                    title: `${i + 1}`,
                    rowId: `${prefix}${command}`,
                    description:
                        menuCategories[i].charAt(0).toUpperCase() +
                        menuCategories[i].slice(1) +
                        " Commands"
                };
                sections[0].rows.push(row);
            }
            const obj = {
                pushname,
                bot: config.BOT,
                version: require("../package.json").version,
                memory: `${(
                    process.memoryUsage().heapUsed /
                    1024 /
                    1024
                ).toFixed(2)}MB / ${Math.round(
                    require("os").totalmem / 1024 / 1024
                )}MB`,
                runtime: `${runtime(process.uptime())}`,
                hostname
            };
            const caption = convertTemplateToES6(
                global.THEME.menus.MENU.templates.body,
                obj
            );
            const listMessage = {
                caption,
                image: {
                    url: config.MENU_MEDIA
                        ? randChoice(config.MENU_MEDIA.split(","))
                        : undefined ||
                          randChoice(global.THEME.menus.MENU.images)
                },
                footer: config.FOOTER,
                buttonText: "🔢 Reply below number,",
                sections,
                contextInfo: {
                    externalAdReply: {
                        title: `「 ${config.BOT} 」`,
                        body: "🄲🅁🄴🄰🅃🄴🄳 🄱🅈 🅃🄺🄼 🄸🄽🄲",
                        mediaType: 1,
                        sourceUrl: global.link,
                        thumbnailUrl: config.LOGO,
                        renderLargerThumbnail: false,
                        showAdAttribution: true
                    }
                }
            };

            return await conn.listMessage(from, listMessage, msg);
        } catch (e) {
            m.sendError(e);
        }
    }
);

cmd({
    pattern: "os",
    alias: ["system"],
    use: '.os',
    react: "🍟",
    category: "main",
    filename: __filename

},

async(conn, mek, m,{ reply }) => {
try{
const sistemInfo = await getSystemInfo()
  getVersions((versi) => {
    getBatteryInfo((statusBaterai) => {
      getStorageInfo((infoPenyimpanan) => {
        getOsInfo((infoLinux) => {
          let txt = `> *📊 Information About System*\n\n`
          txt += `- 🌐 *Platform*: _${sistemInfo.platform}_\n`
          txt += `- 💻 *Architecture CPU*: ${sistemInfo.cpuArch}\n`
          txt += `- 🧠 *Cpu Amount*: ${sistemInfo.cpus}\n`
          txt += `- 🗄️ *Memory Total*: ${sistemInfo.totalMemory}\n`
          txt += `- 🗃️ *Memory Free*: ${sistemInfo.freeMemory}\n`
          txt += `- ⏱️ *Uptime*: ${sistemInfo.uptime}\n`
          txt += `- 📀 *OS version*: ${sistemInfo.osVersion}\n`
          txt += `- 📊 *Load Average: ${sistemInfo.loadAverage}\n`
          txt += `- 🔋 *Battery Info*: ${statusBaterai}\n\n`

          txt += `> *💾 Storage Info*\n`
          txt += `${infoPenyimpanan}\n\n`

          txt += `> *🛠️ Versions of Packages*\n\n`
          txt += `- ☕ *Node.js*: ${versi.nodeVersion.trim()}\n`
          txt += `- 📦 *NPM*: ${versi.npmVersion.trim()}\n`
          txt += `- 🎥 *FFmpeg*: ${versi.ffmpegVersion.split('\n')[0]}\n`
          txt += `- 🐍 *Python*: ${versi.pythonVersion.trim()}\n`
          txt += `- 📦 *PIP*: ${versi.pipVersion.trim()}\n`
          txt += `- 🍫 *Chocolatey*: ${versi.chocoVersion.trim()}\n\n`
          txt += `> *🐧 Linux*\n${infoLinux}\n`

         await replyad(txt)
        })
      })
    })
  })
} catch (e) {
    await m.sendError(e);
}

function getVersions(callback) {
  exec('node -v', (err, nodeVersion) => {
    if (err) nodeVersion = '✖️'
    exec('npm -v', (err, npmVersion) => {
      if (err) npmVersion = '✖️'
      exec('ffmpeg -version', (err, ffmpegVersion) => {
        if (err) ffmpegVersion = '✖️'
        exec('python --version || python3 --version || py --version', (err, pythonVersion) => {
          if (err) pythonVersion = '✖️'
          exec('pip --version || pip3 --version', (err, pipVersion) => {
            if (err) pipVersion = '✖️'
            exec('choco -v', (err, chocoVersion) => {
              if (err) chocoVersion = '✖️'
              callback({ nodeVersion, npmVersion, ffmpegVersion, pythonVersion, pipVersion, chocoVersion })
            })
          })
        })
      })
    })
  })
}

function getStorageInfo(callback) {
  if (os.platform() === 'win32') {
    exec('wmic logicaldisk get size,freespace,caption', (err, stdout) => {
      if (err) return callback('✖️')
      const lines = stdout.trim().split('\n').slice(1)
      const infoPenyimpanan = lines.map(line => {
        const [drive, free, total] = line.trim().split(/\s+/)
        return `🖥️ ${drive}: ${(total / (1024 ** 3)).toFixed(2)} GB total, ${(free / (1024 ** 3)).toFixed(2)} GB bebas`
      }).join('\n')
      callback(infoPenyimpanan)
    })
  } else {
    exec('df -h --output=source,size,avail,target', (err, stdout) => {
      if (err) return callback('✖️')
      const lines = stdout.trim().split('\n').slice(1)
      const infoPenyimpanan = lines.map(line => {
        const [device, total, free, mount] = line.trim().split(/\s+/)
        return `🖥️ ${mount}: ${total} total, ${free} bebas di ${device}`
      }).join('\n')
      callback(infoPenyimpanan)
    })
  }
}

function getOsInfo(callback) {
  if (os.platform().startsWith('win')) {
    exec('wmic os get caption, version, buildnumber', (err, osInfo) => {
      if (err) osInfo = '✖️'
      return callback(osInfo.trim())
    })
  }
  exec('cat /etc/os-release', (err, osInfo) => {
    if (err) osInfo = '✖️'
    callback(osInfo.trim())
  })
}

function getBatteryInfo(callback) {
  if (os.platform() === 'linux' || os.platform() === 'darwin') {
    exec('upower -i $(upower -e | grep BAT)', (err, batteryInfo) => {
      if (err) return callback('✖️')
      callback(batteryInfo)
    })
  } else if (os.platform() === 'win32') {
    exec('WMIC Path Win32_Battery Get EstimatedChargeRemaining', (err, batteryInfo) => {
      if (err) return callback('✖️')
      callback(`🔋 ${batteryInfo.trim()}%`)
    })
  } else {
    callback('✖️')
  }
}

function getSystemInfo() {
  return {
    platform: os.platform(),
    cpuArch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB',
    freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',
    uptime: runtime(os.uptime()),
    osVersion: os.release(),
    loadAverage: os.loadavg().map(load => load.toFixed(2)).join(', ')
  }
}
