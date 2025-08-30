import express from 'express';
import { signup,handleOTPVerification, login } from './views.js';

const user_router = express.Router();

user_router.post('/signup', signup);
user_router.post('/otp',handleOTPVerification);
user_router.post('/login',login);

export default user_router;
