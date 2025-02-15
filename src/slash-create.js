const {REST, Routes} = require('discord.js')
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
        {
          name: 'create',
          description: 'Create a budget',
        },
        {
          name: 'delete',
          description: 'Delete a budget',
        },
        {
          name: 'list',
          description: 'List all budgets',
        },
        {
          name: 'update',
          description: 'Update a budget',
        },
        {
          name: 'view',
          description: 'View a budget',
        },
        {
          name: 'log',
          description: 'Log a transaction', 
        }
      ]}
    )
  } catch (error) {
    console.error(error)
  }
}
slashRegister();