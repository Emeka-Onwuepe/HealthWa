import express from 'express';
import { signup,handleOTPVerification, 
    login, logout, handlePassword, 
    get_all_users} from './views.js';

const user_router = express.Router();

user_router.post('/signup', signup);
// to be removed later
user_router.get('/user',get_all_users)

user_router.post('/otp',handleOTPVerification);
user_router.post('/login',login);
user_router.post('/logout',logout);
user_router.post('/password',handlePassword);


export default user_router;
