import { Request } from "express"
export interface JwtPayload {
    userId: string;
    username: string;
    iat: number;
}

import { Document } from 'mongoose';

export interface IUser extends Document {
    username: string;
    email: string;
    password: string;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;

    matchPassword(password: string): Promise<boolean>;
    getSignedToken(): string;
    getUsernameEmail(): { username: string; email: string };
    getResetPasswordToken(): string;
}

export interface UserType {
    username: string;
    email: string;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
}

export interface IRequest extends Request {
    user: UserType
}
