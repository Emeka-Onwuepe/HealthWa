// create user table
export const createUserTable = async (connection) => {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      full_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone_number VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role ENUM('patient', 'practitioner','admin') NOT NULL DEFAULT 'patient',
      verified_email BOOLEAN DEFAULT FALSE,
      verified_phone_number BOOLEAN DEFAULT FALSE,
      usertoken VARCHAR(255) NOT NULL,
      usertoken_expiry TIMESTAMP,
      image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // create user metadata table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS user_metadata (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      otp VARCHAR(6) NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
};

// function to generate a random token
const generateToken = () => {
  return Math.random().toString(36).substr(2);
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
  const usertoken = generateToken(); // Generate a user token
  const usertoken_expiry = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
  const [result] = await connection.query(`
    INSERT INTO users (full_name, email, phone_number, password, role, usertoken, usertoken_expiry)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [full_name, email, phone_number, password, role, usertoken, usertoken_expiry]);
  // create user metadata
  await createUserMetadata(connection, result.insertId);
  return result.insertId;
};



export const updateUserToken = async (connection, userId) => {
  const usertoken = generateToken();
  const usertoken_expiry = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
  await connection.query(`
    UPDATE users SET usertoken = ?, usertoken_expiry = ? WHERE id = ?
  `, [usertoken, usertoken_expiry, userId]);
  return usertoken;
};

export const getUser = async (connection, identifier, value) => {
  const [user] = await connection.query(`
    SELECT * FROM users WHERE ${identifier} = ?
  `, [value]);
  return user;
};

export const verifyToken = async (connection, usertoken) => {

  if (!usertoken) {
    throw new Error('No token provided');
  }

  const [user] = await getUser(connection, 'usertoken', usertoken);
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
  return user[0];
};