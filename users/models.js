import { decryptPassword,passwordEncryption,generateToken } from './helpers.js'
import { getQueryData } from '../helpers.js'

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
      UPDATE users SET date_of_birth = $1, gender = $2 WHERE id = $3
    `, [dateOfBirth, gender, userId]);
  };

export const set_dob_abt_and_gender = async (connection, userId, dateOfBirth, gender,about_me) => {
    await connection.query(`
      UPDATE users SET date_of_birth = $1, gender = $2 , about_me = $3 WHERE id = $4
    `, [dateOfBirth, gender, about_me, userId]);
  };
 

const generateOTP = () => {
  // Generate a 6-digit OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const setOTP = async (connection, userId) => {
  const otp = generateOTP();
  await connection.query(`
    UPDATE user_metadata SET otp = $1 WHERE user_id = $2
  `, [otp, userId]);
  return otp;
};

export const getOTP = async (connection, userId) => {
  let result = await connection.query(`
    SELECT otp FROM user_metadata WHERE user_id = $1
  `, [userId]);
  result = getQueryData(result)
  return result.otp;
};

// export const createUserMetadata = async (connection, userId) => {

// };

export const createUser = async (connection, userData) => {
  console.log('started create user')
  const { full_name, email, phone_number, password, role } = userData;
  const  e_password = passwordEncryption(password)
  const usertoken = generateToken(); // Generate a user token
  const usertoken_expiry = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
  // create user
  console.log('creating')
  let user =  await connection.query(`
    INSERT INTO users (full_name, email, phone_number, password, role, usertoken, usertoken_expiry)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `, [full_name, email, phone_number, e_password, role, usertoken, usertoken_expiry]);
  // create user metadata
  user = getQueryData(user)
  delete user['created_at']
  delete user['usertoken_expiry']
  delete user['password']
  const otp = generateOTP();
  console.log('creating meta')
  await connection.query(`
    INSERT INTO user_metadata (user_id, otp) VALUES ($1, $2)
  `, [user.id, otp]);
  return user;
};

export const updatePassword = async (connection,new_password,user_id)=>{
  const password = passwordEncryption(new_password)
  await connection.query(`
        UPDATE users SET password = $1 WHERE id = $2
      `, [password, user_id]);
}


export const updateUserToken = async (connection, userId) => {
  const usertoken = generateToken();
  const usertoken_expiry = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
  await connection.query(`
    UPDATE users SET usertoken = $1, usertoken_expiry = $2 WHERE id = $3
  `, [usertoken, usertoken_expiry, userId]);
  return usertoken;
};

export const verify_email_phone = async (connection,name,userId) => {
  await connection.query(`
    UPDATE users SET ${name} = TRUE WHERE id = $1
  `, [userId]);
  // destroy OTP
  await connection.query(`
    UPDATE user_metadata SET otp = NULL WHERE user_id = $1
  `, [userId]);
};

export const getUser = async (connection, identifier, value,password=false) => {
  const user = await connection.query(`
    SELECT * FROM users WHERE ${identifier} = $1
  `, [value]);

  let userData = getQueryData(user)

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
        UPDATE users SET usertoken = NULL, usertoken_expiry = NULL WHERE id = $
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
    UPDATE users SET full_name = $1, email = $2, phone_number = $3,
     role = $4, profile_image = $5, gender = $6, about_me = $7,
     license_number = $8, years_of_experience = $9, specialization = $10,
     date_of_birth = $11 WHERE id = $12
  `, [full_name, email, phone_number, role, profile_image, gender, about_me,
      license_number, years_of_experience, specialization, date_of_birth, userId]);
};

export const updateUserPatient = async (connection, userId, userData) => {
  const { full_name, email, phone_number,role,profile_image,gender,
    date_of_birth } = userData;
  await connection.query(`
    UPDATE users SET full_name = $1, email = $2, phone_number = $3,
     role = $4, profile_image = $5, gender = $6,
     date_of_birth = $7 WHERE id = $8
  `, [full_name, email, phone_number, role, profile_image, gender,
      date_of_birth, userId]);
};
