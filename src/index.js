const Discord = require('discord.js')
require('dotenv').config();

const client = new Discord.Client({intents: ["Guilds"]})

client.on('ready', () => {
  console.log('Bot is ready')
})

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return

  if (interaction.commandName === "create") {
    const textReceived = interaction.options.getString("name")
    interaction.reply({content: `You said ${textReceived}`})
  }
  if (interaction.commandName === "delete") {
    interaction.reply({content: "Delete a budget"})
  }
})

client.login(process.env.DISCORD_TOKEN)