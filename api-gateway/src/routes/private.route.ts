import express from "express";
import { protect } from "../middlewares/auth.middleware";
import { getPrivateData } from "../controllers/private.controller";


export const privateRouter = express.Router();

privateRouter.get("/", protect, getPrivateData);
