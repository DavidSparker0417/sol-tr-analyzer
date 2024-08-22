import express, { Express, Request, Response, json, urlencoded } from "express";
import dotenv from "dotenv";
import apiRoute from "./routes/api.route";
import connectDB from "./db";
import cors from "cors"
import { dbSyncTask } from "./middleware/task";

dotenv.config();

connectDB()
dbSyncTask()

const app: Express = express();
const port = process.env.PORT || 5081;

app.use(cors({origin: '*'}));
app.use(urlencoded({ extended: true }));
app.use(json());

app.use('/api/', apiRoute)

app.get("/", (req: Request, res: Response) => {
  res.send("Express server is runnng ...");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});