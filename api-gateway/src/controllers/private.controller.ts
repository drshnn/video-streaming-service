import { NextFunction, Request, Response } from "express"
import { IRequest } from "../types/jwt.type"

export const getPrivateData = (req: IRequest, res: Response, next: NextFunction) => {
    res.status(200).json({ success: true, data: "you got access to the private data in this route" })
}
