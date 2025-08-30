// Get the client
import mysql from 'mysql2/promise';
import { createUserTable } from './users/models.js';

// Create the connection to database
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'HealthWa',
  password: ''
});

// check if connection is successful
try {
  await connection.connect();
  console.log('Connected to the database');
} catch (error) {
  console.error('Database connection failed:', error);
}

const models = {
  users: createUserTable
};


for (const [model, createModelTable] of Object.entries(models)) {

  // check if tables exist
  const [rows] = await connection.query(`SHOW TABLES LIKE '${model}'`);
  if (rows.length === 0) {
    console.log(`${model.charAt(0).toUpperCase() + model.slice(1)} table does not exist`);
    // create tables
    await createModelTable(connection);
  }
}

export default connection;