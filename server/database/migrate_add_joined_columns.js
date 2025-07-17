import sqlite3 from 'sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '../database.sqlite');

const db = new sqlite3.Database(dbPath);

function addColumnIfNotExists(table, column, type, callback) {
  db.get(`PRAGMA table_info(${table})`, (err, info) => {
    if (err) return callback(err);
    db.all(`PRAGMA table_info(${table})`, (err, columns) => {
      if (err) return callback(err);
      const exists = columns.some(col => col.name === column);
      if (exists) {
        console.log(`Column ${column} already exists in ${table}`);
        return callback();
      }
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${type} DEFAULT 0`, callback);
    });
  });
}

addColumnIfNotExists('scheduled_interviews', 'joined_host', 'BOOLEAN', (err) => {
  if (err) {
    console.error('Error adding joined_host:', err);
  } else {
    console.log('joined_host column ensured.');
    addColumnIfNotExists('scheduled_interviews', 'joined_guest', 'BOOLEAN', (err2) => {
      if (err2) {
        console.error('Error adding joined_guest:', err2);
      } else {
        console.log('joined_guest column ensured.');
      }
      db.close();
    });
  }
}); 