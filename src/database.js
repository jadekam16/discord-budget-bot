const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('expenses.db');

// Initialise database tables
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS budgets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    amount DECIMAL(10,2),
    userId TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    budget_id INTEGER,
    description TEXT,
    amount DECIMAL(10,2),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(budget_id) REFERENCES budgets(id)
  )`);
});