import express, { NextFunction } from "express";
import { Request, Response } from "express";
import bodyParser from "body-parser";
import meetRouter from "./routes/meet";

const app: express.Application = express();
const port: number = 3000;

app.use(bodyParser.json());
app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send("Hello World!");
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
app.use("/meet_bot", meetRouter);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
