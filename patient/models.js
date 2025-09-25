// create patient table
import { getQueryData } from '../helpers.js'
export const createPatientTable = async (connection) => {
    await connection.query(`CREATE TABLE IF NOT EXISTS patient (
        id SERIAL PRIMARY KEY,
        occupation VARCHAR(255),
        weight VARCHAR(50),
        height VARCHAR(50),
        is_diabetic BOOLEAN,
        is_asthmatic BOOLEAN,
        medications TEXT,
        on_long_term_meds BOOLEAN,
        user_id INT UNIQUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`); 
}

export const createPatient = async (connection, patientData) => {
    const { occupation, weight, height, is_diabetic, is_asthmatic, 
             medications, on_long_term_meds, user_id } = patientData;
    const queryData = await connection.query(`INSERT INTO patient (occupation, weight, 
            height, is_diabetic, is_asthmatic, medications, on_long_term_meds,
             user_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             RETURNING * ;
             `,
              [occupation, weight, height, is_diabetic, is_asthmatic, 
                medications, on_long_term_meds, user_id]);
    return getQueryData(queryData)
}



export const getPatientByUserId = async (connection, userId) => {
    let queryData = await connection.query(`SELECT * FROM patient WHERE user_id = $1`, [userId]);
    return getQueryData(queryData);  
}

export const updatePatient = async (connection, userId, patientData) => {
    const { occupation, weight, height, is_diabetic, is_asthmatic, 
             medications, on_long_term_meds } = patientData;
    await connection.query(`UPDATE patient SET occupation = $1, weight = $2, 
            height = $3, is_diabetic = $4, is_asthmatic = $5, medications = $6, 
            on_long_term_meds = $7 WHERE user_id = $8`,
              [occupation, weight, height, is_diabetic, is_asthmatic, 
                medications, on_long_term_meds, userId]);
}

export const updateMedicalHistory = async (connection, userId, medicalData) => {
    const { medical_conditions, allergies, medications, surgeries } = medicalData;
    await connection.query(`UPDATE patient SET medical_conditions = $1, allergies = $2, medications = $3, surgeries = $4 WHERE user_id = $5`,
        [medical_conditions, allergies, medications, surgeries, userId]);
};
