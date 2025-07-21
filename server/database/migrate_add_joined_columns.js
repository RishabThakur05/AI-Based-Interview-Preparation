import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addColumnIfNotExists(table, column, type, defaultValue) {
  // Check if the column exists
  const columnExistsQuery = `
    SELECT column_name FROM information_schema.columns 
    WHERE table_name = $1 AND column_name = $2
  `;
  const res = await pool.query(columnExistsQuery, [table, column]);
  if (res.rows.length > 0) {
    console.log(`Column ${column} already exists in ${table}`);
    return;
  }
  // Add the column
  const alterQuery = `ALTER TABLE ${table} ADD COLUMN ${column} ${type} DEFAULT ${defaultValue}`;
  await pool.query(alterQuery);
  console.log(`${column} column added to ${table}`);
}

(async () => {
  try {
    await addColumnIfNotExists('scheduled_interviews', 'joined_host', 'BOOLEAN', false);
    await addColumnIfNotExists('scheduled_interviews', 'joined_guest', 'BOOLEAN', false);
  } catch (err) {
    console.error('Error adding columns:', err);
  } finally {
    await pool.end();
  }
})(); 