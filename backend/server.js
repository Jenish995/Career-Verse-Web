require('dotenv').config(); // Load environment variables from .env file
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Database connected successfully!');
    // You can perform a simple query to verify the connection
    const res = await client.query('SELECT NOW()');
    console.log('Current database time:', res.rows[0].now);
  } catch (err) {
    console.error('Database connection failed:', err.message);
  } finally {
    // It's good practice to close the connection if this script is just for testing
    // For a long-running server, you'd keep the connection open.
    await client.end();
    console.log('Database connection closed.');
  }
}

connectToDatabase();