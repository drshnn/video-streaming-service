import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRouter from "./routes/upload.route";
import errorHandler from "./middlewares/errorHandler.middleware";
import { NotFoundError } from "./errors/app.error";
import { getAwsClient } from "./utils/awsClient";
import { ListBucketsCommand, ListObjectsCommand } from "@aws-sdk/client-s3";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

app.use(express.json());
app.use("/upload", uploadRouter);
app.get("/status", (req, res) => {
  res.send({ status: "in service" });
});

app.get("/s3", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const buckets = await getAwsClient().send(
      new ListObjectsCommand({ Bucket: "raw-videos-bucket" })
    );
    res.json(buckets);
  } catch (error) {
    next(error);
  }
});

//catch routes KEEP IT AT THE END
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError());
});
app.use(errorHandler);

app.listen(3000, () => {
  console.log("listening on port 3000");
});
