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
            id SERIAL PRIMARY KEY,
            license_number VARCHAR(255) NOT NULL,
            specialization VARCHAR(255) NOT NULL,
            city_of_practice VARCHAR(255) NOT NULL,
            place_of_work VARCHAR(255) NOT NULL,
            region VARCHAR(255) NOT NULL,
            state_of_practice VARCHAR(255) NOT NULL,
            time_zone VARCHAR(255) NOT NULL,
            years_of_experience INT NOT NULL,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
}

export const createDoctor = async (connection, doctorData) => {
    const { license_number, specialization, city_of_practice, place_of_work,
         region, state_of_practice, time_zone, years_of_experience, user_id } = doctorData;
         console.log(doctorData)
    await connection.query(`
        INSERT INTO doctor (license_number, specialization, city_of_practice, 
        place_of_work, region, state_of_practice, time_zone, years_of_experience, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) `, [license_number, specialization, city_of_practice, place_of_work, region, 
        state_of_practice, time_zone, years_of_experience, user_id]);
}

export const updateDoctor = async (connection, doctorData) => {
    const { id, license_number, specialization, city_of_practice, place_of_work,
         region, state_of_practice, time_zone, years_of_experience } = doctorData;
    await connection.query(`
        UPDATE doctor
        SET license_number = $1, specialization = $2, city_of_practice = $3,
            place_of_work = $4, region = $5, state_of_practice = $6, time_zone = $7,
            years_of_experience = $8, user_id = $9
        WHERE id = $10
    `, [license_number, specialization, city_of_practice, place_of_work, region,
        state_of_practice, time_zone, years_of_experience, id]);
}


export const doctorPatientTable = async (connection) =>{
    await connection.query(`
        CREATE TABLE IF NOT EXISTS doctor_patient (
            id SERIAL PRIMARY KEY,
            doctor_id INTEGER NOT NULL,
            patient_id INTEGER NOT NULL,
            FOREIGN KEY (doctor_id) REFERENCES doctor(id) ON DELETE CASCADE,
            FOREIGN KEY (patient_id) REFERENCES patient(id) ON DELETE CASCADE
        )
    `);
}


export const create_user_patient = async (connection, doctor_id, patient_id) => {
    await connection.query(`
        INSERT INTO user_patient (doctor_id, patient_id)
        VALUES ($1, $2)
    `, [doctor_id, patient_id]);
}

export const getPatientsByDoctorId = async (connection, doctor_id) => {
    let queryData = await connection.query(`
       SELECT patient.*,users.*
       FROM patient
       JOIN users ON users.id =  patient.user_id
       WHERE patient.id IN 
       (SELECT patient_id FROM doctor_patient WHERE doctor_id = $1)
    `, [doctor_id]);
    return getQueryData(queryData,true);
    
}

export const getDoctorsByPatientId = async (connection, patient_id) => {
    let queryData = await connection.query(`
       SELECT doctor.*,users.*
       FROM doctor
       JOIN users ON users.id =  doctor.user_id
       WHERE doctor.id IN 
       (SELECT doctor_id FROM doctor_patient WHERE patient_id = $1)
    `, [patient_id]);
    return getQueryData(queryData,true);
    
}

// export const getDoctors_By_UserId = async (connection, user_id) => {
//     const [rows] = await connection.query(`
//         SELECT doctor.*
//         FROM doctor
//         WHERE doctor.user_id = $
//     `, [user_id]);
//     return rows;
// }
