import jwt from 'jsonwebtoken';
import { AppError } from '../error/app.error';
import { NextFunction, Request, Response } from 'express';

import { User } from '../models/User.model'
import { IRequest } from '../types/jwt.type';
// const ErrorResponse = require('../utils/errorResponse')


export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        //Bearer 234325hworihwro2342o424lk4j3o4i343
        token = req.headers.authorization.split(" ")[1]
    }
    if (!token) {
        return next(new AppError("Not authorized to access this route", 401))
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET ?? '');

        if (typeof decoded === 'string') {
            return next(new AppError("No user found with this id", 404))
        }

        const user = await User.findById(decoded?.id);
        if (!user) {
            return next(new AppError("No user found with this id", 404))

        }
        Object.assign(user, {
            context: {
                user: user
            }
        })
        // req.user = user;
        next();
    } catch (error) {
        return next(new AppError("Not authorized to access this route", 401))
    }
}
