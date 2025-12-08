import mysql from 'mysql2/promise';

async function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),
  });

  const [rows] = await pool.query('SELECT 1 AS ok');
  console.log('DB test result:', rows);
  await pool.end();
}

main().catch(err => {
  console.error('DB test error:', err);
});
