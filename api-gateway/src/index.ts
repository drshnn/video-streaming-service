import express from "express";
import cors from "cors";
import errorHandler from "./middlewares/error-handler.middleware";
import dotenv from 'dotenv';
import { authRouter } from "./routes/auth.route";
import { privateRouter } from "./routes/private.route";

dotenv.config();
const app = express();
app.use(express.json());

//cors
app.use(
  cors({
    origin: process.env.CORS_URL,
  })
);

//routes
//routes
app.use('/api/auth/', authRouter)
app.use('/api/private', privateRouter)

//error handler (should be last middleware)
app.use(errorHandler)

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`api-gateway running on ${PORT}`);
});

process.on("unhandledRejection", (err, _promise) => {
  console.log(`Logged Error: ${err}`);
  server.close(() => process.exit(1));
});
