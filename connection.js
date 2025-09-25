// Get the client

// import mysql from 'mysql2/promise';
// import mysql using import('mysql2/promise')
// const mysql = await import('mysql2/promise');
const pg = await import('pg')
import { createUserTable } from './users/models.js';
import { createPatientTable } from './patient/models.js';
import { createAppointmentTable } from './appointment/models.js';
import { doctorPatientTable , createDoctorTable } from './practisioner/models.js';
import data from './locals.js'
// import dotenv from 'dotenv';

// Load environment variables from .env file
// dotenv.config();

// const connection = new pg.Pool({
//   user: data.DB_USER || 'root',
//   database: data.DATABASE || 'HealthWa',
//   password: data.PASSWORD || '',
//   port: data.DB_PORT || 5432,
//   // ssl: true,
//   max: 20, // set pool max size to 20
//   idleTimeoutMillis: 1000, // close idle clients after 1 second
//   connectionTimeoutMillis: 2000, // return an error after 1 second if connection could not be established
//   maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
// })

const connection = new pg.Pool({
connectionString: data.E_HOST,
ssl: true,
max: 20, // set pool max size to 20
idleTimeoutMillis: 5000, // close idle clients after 5 seconds
// connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
})



const models = {
  users: createUserTable,
  patient: createPatientTable,
  appointment: createAppointmentTable,
  doctor: createDoctorTable,
  doctor_patient: doctorPatientTable
};

// try {

//   await connection.query(`ALTER TABLE users
//   DROP COLUMN license_number,
//   DROP COLUMN years_of_experience,
//   DROP COLUMN specialization
//   `)

//   // const result = await connection.query(`ALTER TABLE users
//   // RENAME COLUMN role TO user_role
//   // `)
// } catch (error) {
//   console.log(error)
// }

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