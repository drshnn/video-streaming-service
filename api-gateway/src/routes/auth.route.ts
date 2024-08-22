import express from 'express';
import { register, login, forgotPassword, resetPassword } from '../controllers/auth.controller';

export const authRouter = express.Router();

authRouter.route('/register').post(register)
authRouter.route('/login').post(login)
authRouter.route('/forgotpassword').post(forgotPassword)
authRouter.route('/resetpassword/:resetToken').put(resetPassword)

