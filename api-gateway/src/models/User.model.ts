import crypto from 'crypto';
import mongoose from 'mongoose';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUser } from '../types/jwt.type';

const UserSchema = new mongoose.Schema<IUser>({
    username: {
        type: String,
        required: [true, "Please Provide a username"]
    },
    email: {
        type: String,
        require: [true, "Please Provide an email"],
        unique: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please Provide a vaild email"]
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: 6,
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});


UserSchema.pre('save', async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt)
    next();
})

UserSchema.methods.matchPassword = async function (password: string) {
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.getSignedToken = function () {

    return jwt.sign({ id: this._id }, process.env.JWT_SECRET ?? '', { expiresIn: process.env.JWT_EXPIRE })
}

UserSchema.methods.getUsernameEmail = function () {
    return { username: this.username, email: this.email }
}
UserSchema.methods.getResetPasswordToken = function () {

    const resetToken = crypto.randomBytes(20).toString('hex');

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    this.resetPasswordExpire = Date.now() + 10 * (60 * 1000);

    return resetToken
}

export const User = mongoose.model("User", UserSchema);

