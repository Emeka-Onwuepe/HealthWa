// Get the client

// import mysql from 'mysql2/promise';
// import mysql using import('mysql2/promise')
const mysql = await import('mysql2/promise');

import { createUserTable } from './users/models.js';
import { createPatientTable } from './patient/models.js';
import { createAppointmentTable } from './appointment/models.js';
import { doctorPatientTable , createDoctorTable } from './practisioner/models.js';
import data from './locals.js'
// import dotenv from 'dotenv';

// Load environment variables from .env file
// dotenv.config();

// Create the connection to database
// const connection = await mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   database: 'HealthWa',
//   password: ''
// });

const pg = await import('pg')

const connection = new pg.Pool({
connectionString: data.I_HOST,
ssl: true,
max: 20, // set pool max size to 20
idleTimeoutMillis: 1000, // close idle clients after 1 second
connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
})

// const connection = new pg.Pool({
//   // host: process.env.HOST || 'localhost',
//   // user: process.env.DB_USER || 'root',
//   // database: process.env.DATABASE || 'HealthWa',
//   // password: process.env.PASSWORD || '',
//   // port: process.env.PORT || 5432,
//   // host: data.HOST || 'localhost',
//   user: data.DB_USER || 'root',
//   database: data.DATABASE || 'HealthWa',
//   password: data.PASSWORD || '',
//   port: data.DB_PORT || 5432,
//   // ssl: true,
//   max: 20, // set pool max size to 20
//   idleTimeoutMillis: 1000, // close idle clients after 1 second
//   connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
//   maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
// })


// Create the connection pool. The pool-specific settings are the defaults
// const connection = mysql.createPool({
//   host: process.env.HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   database: process.env.DATABASE || 'HealthWa',
//   password: process.env.PASSWORD || '',
//   waitForConnections: true,
//   connectionLimit: 10,
//   maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
//   idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
//   queueLimit: 0,
//   enableKeepAlive: true,
//   keepAliveInitialDelay: 0,
// });


// Keep the connection alive
// setInterval(async () => {
//   try {
//     await connection.query('SELECT 1');
//   } catch (err) {
//     console.error('Error keeping the connection alive:', err);
//   }
// }, 60000); // Ping every 60 seconds

// check if connection is successful
// try {
//   await connection.connect();
//   console.log('Connected to the database');
// } catch (error) {
//   console.error('Database connection failed:', error);
// }

const models = {
  users: createUserTable,
  patient: createPatientTable,
  appointment: createAppointmentTable,
  doctor: createDoctorTable,
  doctor_patient: doctorPatientTable
};

await connection.connect();

for (const [model, createModelTable] of Object.entries(models)) {

  // check if tables exist (POSTGRESQL)
  const {rows} = await connection.query(`SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = '${model}')`);
  if (!rows[0].exists) {
    console.log(`${model.charAt(0).toUpperCase() + model.slice(1)} table does not exist`);
    // create tables
    console.log(createModelTable)
    await createModelTable(connection);
  }
}

export default connection;