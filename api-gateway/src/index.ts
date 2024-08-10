import express from "express";
import cors from "cors";

const app = express();
app.use(express.json());

//cors
app.use(
  cors({
    origin: process.env.CORS_URL,
  })
);

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
  console.log(`api-gateway running on ${PORT}`);
});

process.on("unhandledRejection", (err, _promise) => {
  console.log(`Logged Error: ${err}`);
  server.close(() => process.exit(1));
});
