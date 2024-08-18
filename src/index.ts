import express, { Express, Request, Response, json, urlencoded } from "express";
import dotenv from "dotenv";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3103;

app.use(urlencoded({ extended: true }));
app.use(json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express server is runnng ...");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});