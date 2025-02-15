const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

const botID = "1339216182544175166";
const serverID = "1214916322111127552";
const botToken = process.env.DISCORD_TOKEN;

const rest = new REST().setToken(botToken);

const slashRegister = async () => {
  try {
    await rest.put(
      Routes.applicationGuildCommands(botID, serverID),
      {
        body: [
          new SlashCommandBuilder()
            .setName("create")
            .setDescription("Create a budget")
            .addStringOption(option => 
              option
                .setName("name")
                .setDescription("The name of the budget")
                .setRequired(true)
                .setMaxLength(30)
            )
            .addNumberOption(option =>
              option
                .setName("amount")
                .setDescription("The total budget amount")
                .setRequired(true)
                .setMinValue(0)
            ),

          new SlashCommandBuilder()
            .setName("view")
            .setDescription("View a budget")
            .addStringOption(option =>
              option
                .setName("name")
                .setDescription("The name of the budget")
                .setRequired(true)
            ),

          new SlashCommandBuilder()
            .setName("list")
            .setDescription("List all budgets"),

          new SlashCommandBuilder()
            .setName("add")
            .setDescription("Add an expense to a budget")
            .addStringOption(option =>
              option
                .setName("budget")
                .setDescription("The name of the budget")
                .setRequired(true)
            )
            .addNumberOption(option =>
              option
                .setName("amount")
                .setDescription("The expense amount")
                .setRequired(true)
                .setMinValue(0)
            )
            .addStringOption(option =>
              option
                .setName("description")
                .setDescription("Description of the expense")
                .setRequired(true)
            ),
          new SlashCommandBuilder()
            .setName("delete")
            .setDescription("Delete a budget and all its expenses")
            .addStringOption(option =>
              option
                .setName("name")
                .setDescription("The name of the budget to delete")
                .setRequired(true)
            ),
          new SlashCommandBuilder()
            .setName("update")
            .setDescription("Update a budget amount")
            .addStringOption(option =>
              option
                .setName("name")
                .setDescription("The name of the budget to update")
                .setRequired(true)
            )
            .addNumberOption(option =>
              option
                .setName("amount")
                .setDescription("New budget amount")
                .setRequired(true)
                .setMinValue(0)
            )
        ]
      }
    );
  } catch (error) {
    console.error(error);
  }
};

slashRegister();