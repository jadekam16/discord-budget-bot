const Discord = require('discord.js');
const sqlite3 = require('sqlite3').verbose();
const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
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
      const underBudgetGifs = [
        'src/assets/cat-cool.gif',
        'src/assets/cute-cat-cat-cute.gif',
        'src/assets/high-five-cat.gif',
        'src/assets/proud-of-you.gif',
        'src/assets/meme-maker-mememaker.gif'
      ];
      
      const overBudgetGifs = [
        'src/assets/i-blew-the-budget-spent-it-all.mp4',
        'src/assets/sad-cat-cat-in-front-of-sea.gif',
        'src/assets/crying-cat-sad-cat.mp4'
      ];

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

          const gifList = budget.remaining >= 0 ? underBudgetGifs : overBudgetGifs;
          const randomGif = gifList[Math.floor(Math.random() * gifList.length)];
          
          const file = new AttachmentBuilder(randomGif);
          const embed = new Discord.EmbedBuilder()
            .setTitle(`Budget: ${budget.name}`)
            .setColor(0x0099FF)
            .addFields(
              { name: 'Total Budget', value: `$${budget.amount}` },
              { name: 'Total Spent', value: `$${budget.total_spent || 0}` },
              { name: 'Remaining', value: `$${budget.remaining}` }
            )
            .setImage(`attachment://${randomGif.split('/').pop()}`);

          interaction.reply({
            embeds: [embed],
            files: [file]
          });
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

      case "delete":
        const deleteName = interaction.options.getString("name");
        
        // First check if the budget exists and belongs to the user
        db.get(
          'SELECT id FROM budgets WHERE name = ? AND userId = ?',
          [deleteName, userId],
          (err, budget) => {
            if (err) {
              interaction.reply({content: 'Error checking budget!', ephemeral: true});
              return;
            }
            
            if (!budget) {
              interaction.reply({content: 'Budget not found or you don\'t have permission to delete it!', ephemeral: true});
              return;
            }

            // Delete associated expenses first due to foreign key constraint
            db.run(
              'DELETE FROM expenses WHERE budget_id = ?',
              [budget.id],
              (err) => {
                if (err) {
                  interaction.reply({content: 'Error deleting expenses!', ephemeral: true});
                  return;
                }

                // Then delete the budget
                db.run(
                  'DELETE FROM budgets WHERE id = ?',
                  [budget.id],
                  (err) => {
                    if (err) {
                      interaction.reply({content: 'Error deleting budget!', ephemeral: true});
                      return;
                    }
                    
                    interaction.reply({content: `Successfully deleted budget "${deleteName}" and all its expenses.`});
                  }
                );
              }
            );
          }
        );
        break;

      case "update":
        const updateName = interaction.options.getString("name");
        const newAmount = interaction.options.getNumber("amount");

        // Check if the budget exists and belongs to the user
        db.get(
          'SELECT id FROM budgets WHERE name = ? AND userId = ?',
          [updateName, userId],
          (err, budget) => {
            if (err) {
              interaction.reply({content: 'Error checking budget!', ephemeral: true});
              return;
            }

            if (!budget) {
              interaction.reply({content: 'Budget not found or you don\'t have permission to update it!', ephemeral: true});
              return;
            }

            // Update the budget amount
            db.run(
              'UPDATE budgets SET amount = ? WHERE id = ?',
              [newAmount, budget.id],
              (err) => {
                if (err) {
                  interaction.reply({content: 'Error updating budget!', ephemeral: true});
                  return;
                }

                interaction.reply({content: `Successfully updated budget "${updateName}" to $${newAmount}`});
              }
            );
          }
        );
        break;
  }
});

client.login(process.env.DISCORD_TOKEN);