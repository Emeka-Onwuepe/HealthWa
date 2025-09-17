import { decryptPassword,passwordEncryption,generateToken } from './helpers.js'

// create user table (postgres syntax) 
export const createUserTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone_number VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'patient',
      verified_email BOOLEAN DEFAULT FALSE,
      verified_phone_number BOOLEAN DEFAULT FALSE,
      usertoken VARCHAR(255) NOT NULL,
      usertoken_expiry TIMESTAMP NULL DEFAULT NULL,
      profile_image VARCHAR(255),
      gender VARCHAR(6) CHECK (gender IN ('male', 'female', 'other')) DEFAULT 'other',
      about_me TEXT, 
      license_number VARCHAR(25),
      years_of_experience VARCHAR(5),
      specialization VARCHAR(100),
      date_of_birth DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);


  // create user metadata table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_metadata (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL,
      otp VARCHAR(6) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
};

export const set_dob_and_gender = async (connection, userId, dateOfBirth, gender) => {
    await connection.query(`
      UPDATE users SET date_of_birth = ?, gender = ? WHERE id = ?
    `, [dateOfBirth, gender, userId]);
  };

export const set_dob_abt_and_gender = async (connection, userId, dateOfBirth, gender,about_me) => {
    await connection.query(`
      UPDATE users SET date_of_birth = ?, gender = ? , about_me = ? WHERE id = ?
    `, [dateOfBirth, gender, about_me, userId]);
  };
 

const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const setOTP = async (connection, userId) => {
  const otp = generateOTP();
  await connection.query(`
    UPDATE user_metadata SET otp = ? WHERE user_id = ?
  `, [otp, userId]);
  return otp;
};

export const getOTP = async (connection, userId) => {
  const [result] = await connection.query(`
    SELECT otp FROM user_metadata WHERE user_id = ?
  `, [userId]);
  return result ? result[0].otp : null;
};

export const createUserMetadata = async (connection, userId) => {
  const otp = generateOTP();
  await connection.query(`
    INSERT INTO user_metadata (user_id, otp) VALUES (?, ?)
  `, [userId, otp]);
};

export const createUser = async (connection, userData) => {
  const { full_name, email, phone_number, password, role } = userData;
  const  e_password = passwordEncryption(password)
  const usertoken = generateToken(); // Generate a user token
  const usertoken_expiry = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
  const [result] = await connection.query(`
    INSERT INTO users (full_name, email, phone_number, password, role, usertoken, usertoken_expiry)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [full_name, email, phone_number, e_password, role, usertoken, usertoken_expiry]);
  // create user metadata
  await createUserMetadata(connection, result.insertId);
  return result.insertId;
};

export const updatePassword = async (connection,new_password,user_id)=>{
  const password = passwordEncryption(new_password)
  await connection.query(`
        UPDATE users SET password = ? WHERE id = ?
      `, [password, user_id]);
}


export const updateUserToken = async (connection, userId) => {
  const usertoken = generateToken();
  const usertoken_expiry = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
  await connection.query(`
    UPDATE users SET usertoken = ?, usertoken_expiry = ? WHERE id = ?
  `, [usertoken, usertoken_expiry, userId]);
  return usertoken;
};

export const verify_email_phone = async (connection,name,userId) => {
  await connection.query(`
    UPDATE users SET ${name} = TRUE WHERE id = ?
  `, [userId]);
  // destroy OTP
  await connection.query(`
    UPDATE user_metadata SET otp = NULL WHERE user_id = ?
  `, [userId]);
};

export const getUser = async (connection, identifier, value,password=false) => {
  const [user] = await connection.query(`
    SELECT * FROM users WHERE ${identifier} = ?
  `, [value]);
  let [userData] = user

  if (!userData) {
    throw new Error('User not found');
  }
  
    delete userData['created_at']
    delete userData['usertoken_expiry']
    if (!password){
      delete userData['password']
    }else{
      userData['password'] = decryptPassword(userData['password'])
    }
    
  return [userData];
};

export const verifyToken = async (connection, usertoken,password=false) => {

  if (!usertoken) {
    throw new Error('No token provided');
  }

  const [user] = await getUser(connection, 'usertoken', usertoken,password);
  if (!user) {
    throw new Error('User not found');
  }else{
    // check if token is expired
    if (user.usertoken_expiry < new Date()) {
      // set token to null
      await connection.query(`
        UPDATE users SET usertoken = NULL, usertoken_expiry = NULL WHERE id = ?
      `, [user.id]);
      throw new Error('Token expired');
    }
  }
  return user;
};

export const updateUser = async (connection, userId, userData) => {
  const { full_name, email, phone_number,
     role,profile_image,gender,about_me,
    license_number,years_of_experience,specialization,date_of_birth } = userData;
  await connection.query(`
    UPDATE users SET full_name = ?, email = ?, phone_number = ?,
     role = ?, profile_image = ?, gender = ?, about_me = ?,
     license_number = ?, years_of_experience = ?, specialization = ?,
     date_of_birth = ? WHERE id = ?
  `, [full_name, email, phone_number, role, profile_image, gender, about_me,
      license_number, years_of_experience, specialization, date_of_birth, userId]);
};

export const updateUserPatient = async (connection, userId, userData) => {
  const { full_name, email, phone_number,role,profile_image,gender,
    date_of_birth } = userData;
  await connection.query(`
    UPDATE users SET full_name = ?, email = ?, phone_number = ?,
     role = ?, profile_image = ?, gender = ?,
     date_of_birth = ? WHERE id = ?
  `, [full_name, email, phone_number, role, profile_image, gender,
      date_of_birth, userId]);
};
