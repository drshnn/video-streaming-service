import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRouter from "./routes/upload.route";
import errorHandler from "./middlewares/errorHandler.middleware";
import { NotFoundError } from "./errors/app.error";

dotenv.config();

// process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';


const app = express();
app.use(express.json());
app.use(cors());

app.use(express.json());
app.use("/upload", uploadRouter);
app.get("/status", (req, res) => {
  res.send({ status: "in service" });
});


//catch routes KEEP IT AT THE END
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError());
});
app.use(errorHandler);

app.listen(3000, () => {
  console.log("listening on port 3000");
});
