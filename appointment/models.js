export const createAppointmentTable = async (connection) => {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS appointment (
            id INT AUTO_INCREMENT PRIMARY KEY,
            type VARCHAR(100) NOT NULL,
            symptoms TEXT NOT NULL,
            preferred_professional VARCHAR(255),
            preferred_gender ENUM('male', 'female', 'other'),
            doctor_id INT NOT NULL,
            patient_id INT NOT NULL,
            schedule DATETIME NOT NULL,
            status ENUM('upcoming', 'completed', 'cancelled', 'pending', 'ongoing') NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (doctor_id) REFERENCES users(id),
            FOREIGN KEY (patient_id) REFERENCES users(id)
        )
    `);
}


export const create_appointment = async (connection, appointmentData) => {
    const { type, symptoms, preferred_professional, preferred_gender, doctor_id, 
            patient_id, schedule, status } = appointmentData;
    await connection.query(`
        INSERT INTO appointment (type, symptoms, preferred_professional, preferred_gender, doctor_id, patient_id, schedule, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [type, symptoms, preferred_professional, preferred_gender, doctor_id, patient_id, schedule, status]);
}

export const get_appointments_by_user = async (connection, userId) => {
    const [rows] = await connection.query(`
        SELECT * FROM appointment 
        WHERE doctor_id = ? OR patient_id = ?
        ORDER BY schedule DESC
    `, [userId, userId]);
    return rows;
}
export const update_appointment_status = async (connection, appointmentId, status) => {
    await connection.query(`
        UPDATE appointment SET status = ? WHERE id = ?
    `, [status, appointmentId]);
}

export const delete_appointment = async (connection, appointmentId) => {
    await connection.query(`
        DELETE FROM appointment WHERE id = ?
    `, [appointmentId]);
}

export const get_appointments_by_status = async (connection, status) => {
    const [rows] = await connection.query(`
        SELECT * FROM appointment WHERE status = ?
    `, [status]);
    return rows;
}