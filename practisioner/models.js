export const user_patient_table = async (connection) =>{
    await connection.query(`
        CREATE TABLE IF NOT EXISTS user_patient (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            patient_id INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    `);
}


export const create_user_patient = async (connection, user_id, patient_id) => {
    await connection.query(`
        INSERT INTO user_patient (user_id, patient_id)
        VALUES (?, ?)
    `, [user_id, patient_id]);
}

export const getPatientsByUserId = async (connection, user_id) => {
    const [rows] = await connection.query(`
        SELECT patient.*
        FROM patient
        JOIN user_patient ON patient.id = user_patient.patient_id
        WHERE user_patient.user_id = ?
    `, [user_id]);
    return rows;
}