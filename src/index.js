const Discord = require('discord.js')
require('dotenv').config();

const client = new Discord.Client({intents: ["Guilds"]})

client.on('ready', () => {
  console.log('Bot is ready')
})

client.login(process.env.DISCORD_TOKEN)