import connection from "../connection.js";
import { createUser, getUser,getOTP,setOTP,verifyToken,
        updateUserToken,  verify_email_phone

 } from "./models.js";
import sendEmail from '../email/email_sender.js';


export const signup = async (req, res) => {
  
  const { full_name, email, phone_number, password, role } = req.body;
  const userId = await createUser(connection, { full_name, email, phone_number, password, role });
  // get the user
  const [user] = await getUser(connection, 'id', userId);
  // get the user's OTP
  const otp = await getOTP(connection, userId);
  // send OTP to user's email
  await sendEmail(user.email, 'Your OTP', `Your OTP is ${otp}`, `<b>Your OTP is ${otp}</b>`);
  res.status(201).json({ user });

};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const [user] = await getUser(connection, 'email', email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  if (user.password !== password) {
    return res.status(401).json({ message: 'Invalid password' });
  }
  // update user token
  const usertoken = await updateUserToken(connection, user.id);
  user.usertoken = usertoken;
  res.status(200).json({ user });
};



export const handleOTPVerification = async (req, res) => {
  const { action, otp, usertoken } = req.body;
  let user;

  try {
    user = await verifyToken(connection, usertoken);
  } catch (error) {
    return res.status(401).json({ message: error.message });
  }

  if (action === 'get_otp') {
    const otp = await setOTP(connection, user.id);
    await sendEmail(user.email, 'Your OTP', `Your OTP is ${otp}`, `<b>Your OTP is ${otp}</b>`);
    return res.status(200).json({ message: 'OTP sent to email' });

  }else{

      const storedOTP = await getOTP(connection, user.id);
      if (storedOTP !== otp) {
      return res.status(401).json({ message: 'Invalid OTP' });
      }else{

        if(action == 'verify_email'){
          await verify_email_phone(connection,'verified_email',user.id);
          return res.status(200).json({ message: 'Email verified successfully' });

        }else if(action == 'verify_phone_number'){
          await verify_email_phone(connection,'verified_phone_number',user.id);
          return res.status(200).json({ message: 'Phone number verified successfully' });

        }
    }
  }
};


export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const [user] = await getUser(connection, 'email', email);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  // Generate OTP and send email
  await setOTP(connection, user.id);
  res.status(200).json({ message: 'OTP sent to email' });
};
