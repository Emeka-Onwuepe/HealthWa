// create patient table

export const createPatientTable = async (connection) => {
    await connection.query(`CREATE TABLE IF NOT EXISTS patient (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
    await connection.query(`INSERT INTO patient (occupation, weight, 
            height, is_diabetic, is_asthmatic, medications, on_long_term_meds,
             user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [occupation, weight, height, is_diabetic, is_asthmatic, 
                medications, on_long_term_meds, user_id]);
}



export const getPatientByUserId = async (connection, userId) => {
    const [rows] = await connection.query(`SELECT * FROM patient WHERE user_id = ?`, [userId]);
    return rows[0];
}

export const updatePatient = async (connection, userId, patientData) => {
    const { occupation, weight, height, is_diabetic, is_asthmatic, 
             medications, on_long_term_meds } = patientData;
    await connection.query(`UPDATE patient SET occupation = ?, weight = ?, 
            height = ?, is_diabetic = ?, is_asthmatic = ?, medications = ?, 
            on_long_term_meds = ? WHERE user_id = ?`,
              [occupation, weight, height, is_diabetic, is_asthmatic, 
                medications, on_long_term_meds, userId]);
}

export const updateMedicalHistory = async (connection, userId, medicalData) => {
    const { medical_conditions, allergies, medications, surgeries } = medicalData;
    await connection.query(`UPDATE patient SET medical_conditions = ?, allergies = ?, medications = ?, surgeries = ? WHERE user_id = ?`,
        [medical_conditions, allergies, medications, surgeries, userId]);
};
