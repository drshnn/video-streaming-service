import crypto from 'crypto';
import { AppError } from '../error/app.error';
import { User } from '../models/User.model';
import { NextFunction, Request, Response } from 'express';
import { IUser } from '../types/jwt.type';
import { sendEmail } from '../utils/send-emails.util';
import { Document } from 'mongoose';

export const register = async (req: Request, res: Response, next: NextFunction) => {
    const { username, email, password } = req.body;
    try {
        const user = await User.create({
            username, email, password
        });
        sendToken(user, 201, res)
    } catch (error) {
        next(error)
    }

}


export const login = async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError("Please Provide an email and password"))
    }
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return next(new AppError("Please Provide an email and password", 401))
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return next(new AppError("Invalid Credentials", 401))
        }

        sendToken(user, 201, res)
    } catch (error) {
        return next(error)
    }

}


export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next(new AppError("Email could not be sent", 404))
        }
        const resetToken = user.getResetPasswordToken()
        console.log('first')

        await user.save();

        const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`

        const message = `
   <h1>You have requested a password reset</h1>
   <p>Please go to this link to reset your password</p>
   <a href=${resetUrl} clicktracking = off>${resetUrl}</a>
   `
        //sending email
        try {
            await sendEmail({
                to: user.email,
                subject: "Reset Your Password",
                text: message

            })
            res.status(200).json({ success: true, data: "Email sent" })
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save()
            return next(new AppError("email could not be send", 500))
        }
    } catch (error) {
        console.log('failed')
        next(error);
    }
}


export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex')

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        })

        if (!user) {
            return next(new AppError("Invalid Reset Token", 400))
        }

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        res.status(201).json({
            success: true,
            data: "Password Reset Success"
        })
    } catch (error) {
        next(error)
    }

}



const sendToken = (user: Document<unknown, {}, IUser> & IUser & Required<{
    _id: unknown;
}>
    , statusCode: number, res: Response) => {
    const token = user.getSignedToken()
    const userData = user.getUsernameEmail()
    res.status(statusCode).json({ success: true, token, userData })
}
