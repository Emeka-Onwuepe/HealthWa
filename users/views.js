import connection from "../connection.js";
import { createUser, getUser,getOTP,setOTP,verifyToken,
        updateUserToken,  verify_email_phone,updatePassword

 } from "./models.js";
import sendEmail from '../email/email_sender.js';


export const signup = async (req, res) => {
  await connection.connect();
  console.log('started')
  const { full_name, email, phone_number, password, role } = req.body;
  // get the user
  try {
    // create user
    console.log('create user')
    const user = await createUser(connection, { full_name, email, phone_number, password, role });
    // get the user's OTP
    console.log('get otp')
    const otp = await getOTP(connection, user.id);
    // send OTP to user's email
    console.log('otp',otp);

    // await sendEmail(user.email, 'Your OTP', `Your OTP is ${otp}`, `<b>Your OTP is ${otp}</b>`);
    return res.status(201).json({ user });

  } catch (error) {
    const  constraint = error.constraint
    if (constraint == 'users_email_key'){
      const [user] = await getUser(connection, 'email', email);
      if(user.verified_email){
        return res.status(400).json({ message: 'user already exists' });
      }else{
        // get the user's OTP
        const otp = await getOTP(connection, user.id);
        // send OTP to user's email
        await sendEmail(user.email, 'Your OTP', `Your OTP is ${otp}`, `<b>Your OTP is ${otp}</b>`);
        return res.status(201).json({ user });
      }
      
    }
  }
 
};


export const login = async (req, res) => {
  await connection.connect();
  const { email, password } = req.body;
  const [user] = await getUser(connection, 'email', email,true);
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
  await connection.connect();
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


export const logout = async (req, res) => {
  await connection.connect();
  const { usertoken } = req.body;
  try {
   const [user] = await getUser(connection,'usertoken',usertoken)
   await updateUserToken(connection,user.id);
   return res.status(200).json({ message: 'Logged out successfully' });

  } catch (error) {
    console.log(error)
  }
    
};


// export const forgotPassword = async (req, res) => {
//   const { email } = req.body;
//   const [user] = await getUser(connection, 'email', email);
//   if (!user) {
//     return res.status(404).json({ message: 'User not found' });
//   }
//   // Generate OTP and send email
//   await setOTP(connection, user.id);
//   res.status(200).json({ message: 'OTP sent to email' });
// };


export const handlePassword = async (req,res) =>{
  const {action} = req.body;

  switch(action) {
    case 'forgot_password':
      // handle forgot password
      break;
    case 'reset_password':
      // handle reset password
      const {old_password, new_password,usertoken} = req.body;
      try {
        const user = await verifyToken(connection, usertoken,true);
        if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
        }
        // Check if old password is correct
        if (user.password !== old_password) {
          return res.status(401).json({ message: 'Invalid old password' });
        }
        // Update password
        await updatePassword(connection,new_password,user.id)
        // update token
        await updateUserToken(connection, user.id);
        return res.status(200).json({ message: 'Password reset successfully' });
      } catch (error) {
        return res.status(401).json({ message: error.message });

      }
      
    default:
      return res.status(400).json({ message: 'Invalid action' });
  }

}
