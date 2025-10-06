export const getUserBySocketId = async (socket_id,connection) => {
  const result = await connection.query(`
    SELECT u.*, um.* FROM users u
    JOIN user_metadata um ON u.id = um.user_id
    WHERE um.socket_id = $1
  `, [socket_id]);
    return result.rows[0];
};

export const updateUserSocket = async (user_token, socket_id, connected,connection) => {
    console.log(socket_id,user_token)
  const result = await connection.query(`
    UPDATE user_metadata
    SET socket_id = $1, connected = $2
    WHERE user_id = (SELECT id FROM users WHERE usertoken = $3)
    RETURNING *;
  `, [socket_id, connected, user_token]);
  return result.rows[0];
};

export const closeUserSocket = async (socket_id, connected) => {
    console.log(socket_id,user_token)
  const result = await connection.query(`
    UPDATE user_metadata
    SET socket_id = '', connected = false
    WHERE socket_id = $1
  `, [socket_id]);
  return result.rowCount > 0;
};


