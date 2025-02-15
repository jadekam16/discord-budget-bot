// index.js
const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const client = new Discord.Client({
  intents: ["Guilds"]
});

const db = new sqlite3.Database('expenses.db');

client.on('ready', () => {
  console.log('Bot is ready');
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isCommand()) return;

  const userId = interaction.user.id;

  switch (interaction.commandName) {
    case "create":
      const name = interaction.options.getString("name");
      const amount = interaction.options.getNumber("amount");
      
      db.run(
        'INSERT INTO budgets (name, amount, userId) VALUES (?, ?, ?)',
        [name, amount, userId],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              interaction.reply({content: 'A budget with this name already exists!', ephemeral: true});
            } else {
              interaction.reply({content: `Error creating budget!: ${err}`, ephemeral: true});
            }
            return;
          }
          interaction.reply({content: `Created budget "${name}" with amount $${amount}`});
        }
      );
      break;

    case "view":
      const viewName = interaction.options.getString("name");
      
      db.get(
        `SELECT b.*, 
                SUM(e.amount) as total_spent,
                (b.amount - COALESCE(SUM(e.amount), 0)) as remaining
         FROM budgets b 
         LEFT JOIN expenses e ON b.id = e.budget_id
         WHERE b.name = ? AND b.userId = ?
         GROUP BY b.id`,
        [viewName, userId],
        (err, budget) => {
          if (err) {
            interaction.reply({content: 'Error retrieving budget!', ephemeral: true});
            return;
          }
          if (!budget) {
            interaction.reply({content: 'Budget not found!', ephemeral: true});
            return;
          }
          
          const embed = new Discord.EmbedBuilder()
            .setTitle(`Budget: ${budget.name}`)
            .setColor(0x0099FF)
            .addFields(
              { name: 'Total Budget', value: `$${budget.amount}` },
              { name: 'Total Spent', value: `$${budget.total_spent || 0}` },
              { name: 'Remaining', value: `$${budget.remaining}` }
            );
          
          interaction.reply({embeds: [embed]});
        }
      );
      break;

    case "add":
      const budgetName = interaction.options.getString("budget");
      const expenseAmount = interaction.options.getNumber("amount");
      const description = interaction.options.getString("description");

      db.get(
        'SELECT id FROM budgets WHERE name = ? AND userId = ?',
        [budgetName, userId],
        (err, budget) => {
          if (err || !budget) {
            interaction.reply({content: 'Budget not found!', ephemeral: true});
            return;
          }

          db.run(
            'INSERT INTO expenses (budget_id, amount, description) VALUES (?, ?, ?)',
            [budget.id, expenseAmount, description],
            function(err) {
              if (err) {
                interaction.reply({content: 'Error adding expense!', ephemeral: true});
                return;
              }
              interaction.reply({
                content: `Added expense of $${expenseAmount} to "${budgetName}" budget: ${description}`
              });
            }
          );
        }
      );
      break;

    case "list":
      db.all(
        `SELECT b.*, 
                SUM(e.amount) as total_spent,
                (b.amount - COALESCE(SUM(e.amount), 0)) as remaining
         FROM budgets b 
         LEFT JOIN expenses e ON b.id = e.budget_id
         WHERE b.userId = ?
         GROUP BY b.id`,
        [userId],
        (err, budgets) => {
          if (err) {
            interaction.reply({content: 'Error retrieving budgets!', ephemeral: true});
            return;
          }
          
          if (budgets.length === 0) {
            interaction.reply({content: 'No budgets found!'});
            return;
          }

          const embed = new Discord.EmbedBuilder()
            .setTitle('Your Budgets')
            .setColor(0x0099FF);

          budgets.forEach(budget => {
            embed.addFields({
              name: budget.name,
              value: `Budget: $${budget.amount}\nSpent: $${budget.total_spent || 0}\nRemaining: $${budget.remaining}`
            });
          });

          interaction.reply({embeds: [embed]});
        }
      );
      break;
  }
});

client.login(process.env.DISCORD_TOKEN);