export const createAppointmentTable = async (connection) => {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS appointment (
            id SERIAL PRIMARY KEY,
            type VARCHAR(50) NOT NULL,
            symptoms TEXT NOT NULL,
            preferred_professional VARCHAR(50),
            preferred_gender VARCHAR(10) CHECK (preferred_gender IN ('male', 'female', 'other')),
            doctor_id INTEGER NOT NULL,
            patient_id INTEGER NOT NULL,
            schedule TIMESTAMP NOT NULL,
            status VARCHAR(15) CHECK (status IN ('upcoming', 'completed', 'cancelled', 'pending', 'ongoing')) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (doctor_id) REFERENCES users(id),
            FOREIGN KEY (patient_id) REFERENCES users(id)
        );

        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER update_updated_at_trigger
          BEFORE UPDATE ON appointment
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at();

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