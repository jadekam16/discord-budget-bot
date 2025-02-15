const {REST, Routes, SlashCommandBuilder} = require('discord.js')
require('dotenv').config();

// Info needed for slash commands
const botID = "1339216182544175166"
const serverID = "1214916322111127552"
const botToken = process.env.DISCORD_TOKEN

const rest = new REST().setToken(botToken)

// Register the commands
const slashRegister = async () => {
  try {
    // Register the commands
    await rest.put(
      // endpoint for registering commands (where bot should register slash commands)
      Routes.applicationGuildCommands(botID, serverID),
      // info request 
      {body: [
        new SlashCommandBuilder()
        .setName("create")
        .setDescription("Create a budget")
        .addStringOption(option => {
          return option 
          .setName("name")
          .setDescription("The name of the budget")
          // required options must always be above non-required options
          .setRequired(true)
          .setMaxLength(30)
        }),

        new SlashCommandBuilder() 
        .setName("delete")
        .setDescription("Delete a budget"),

        new SlashCommandBuilder()
        .setName("list")
        .setDescription("List all budgets"),

        new SlashCommandBuilder()
        .setName("update")
        .setDescription("Update a budget"),

        new SlashCommandBuilder()
        .setName("add")
        .setDescription("Add an expense to a budget"),

        new SlashCommandBuilder()
        .setName("remove")
        .setDescription("Remove an expense from a budget"),

        new SlashCommandBuilder()
        .setName("view")
        .setDescription("View a budget")
      ]}
    )
  } catch (error) {
    console.error(error)
  }
}
slashRegister();