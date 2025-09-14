// const doctor = { 
//       license_number,
//       specialization,
//       city_of_practice,
//       license_number,
//       place_of_work,
//       region,
//       state_of_practice,
//       time_zone,
//       years_of_experience,
// }

export const createDoctorTable = async (connection) => {
    await connection.query(`
        CREATE TABLE IF NOT EXISTS doctor (
            id INT AUTO_INCREMENT PRIMARY KEY,
            license_number VARCHAR(255) NOT NULL,
            specialization VARCHAR(255) NOT NULL,
            city_of_practice VARCHAR(255) NOT NULL,
            place_of_work VARCHAR(255) NOT NULL,
            region VARCHAR(255) NOT NULL,
            state_of_practice VARCHAR(255) NOT NULL,
            time_zone VARCHAR(255) NOT NULL,
            years_of_experience INT NOT NULL,
            user_id INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);
}

export const userPatientTable = async (connection) =>{
    await connection.query(`
        CREATE TABLE IF NOT EXISTS user_patient (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            patient_id INT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (patient_id) REFERENCES patient(id)
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
        SELECT patient.*,users.*
        FROM patient
        JOIN user_patient ON patient.id = user_patient.patient_id
        JOIN users ON users.id =  user_patient.user_id
        WHERE user_patient.user_id = ?
        
    `, [user_id]);
    return rows;
}


export const createDoctor = async (connection, doctorData) => {
    const { license_number, specialization, city_of_practice, place_of_work,
         region, state_of_practice, time_zone, years_of_experience, user_id } = doctorData;
         console.log(doctorData)
    await connection.query(`
        INSERT INTO doctor (license_number, specialization, city_of_practice, 
        place_of_work, region, state_of_practice, time_zone, years_of_experience, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) `, [license_number, specialization, city_of_practice, place_of_work, region, 
        state_of_practice, time_zone, years_of_experience, user_id]);
}

export const updateDoctor = async (connection, doctorData) => {
    const { id, license_number, specialization, city_of_practice, place_of_work,
         region, state_of_practice, time_zone, years_of_experience } = doctorData;
    await connection.query(`
        UPDATE doctor
        SET license_number = ?, specialization = ?, city_of_practice = ?,
            place_of_work = ?, region = ?, state_of_practice = ?, time_zone = ?,
            years_of_experience = ?, user_id = ?
        WHERE id = ?
    `, [license_number, specialization, city_of_practice, place_of_work, region,
        state_of_practice, time_zone, years_of_experience, id]);
}

export const getDoctorsByUserId = async (connection, user_id) => {
    const [rows] = await connection.query(`
        SELECT doctor.*
        FROM doctor
        WHERE doctor.user_id = ?
    `, [user_id]);
    return rows;
}
