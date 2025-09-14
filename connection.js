// Get the client
import mysql from 'mysql2/promise';
import { createUserTable } from './users/models.js';
import { createPatientTable } from './patient/models.js';
import { createAppointmentTable } from './appointment/models.js';
import { userPatientTable , createDoctorTable } from './practisioner/models.js';

// Create the connection to database
const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'HealthWa',
  password: ''
});


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
  user_patient: userPatientTable,
  doctor: createDoctorTable
};


for (const [model, createModelTable] of Object.entries(models)) {

  // check if tables exist
  const [rows] = await connection.query(`SHOW TABLES LIKE '${model}'`);
  if (rows.length === 0) {
    console.log(`${model.charAt(0).toUpperCase() + model.slice(1)} table does not exist`);
    // create tables
    console.log(createModelTable)
    await createModelTable(connection);
  }
}

export default connection;