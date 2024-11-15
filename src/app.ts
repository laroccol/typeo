import express from "express";
import raceRouter from "./routes/race";
import statsRouter from "./routes/stats";
import leaderboardRouter from "./routes/leaderboard";
import userRouter from "./routes/users";
import improvementRouter from "./routes/improvement";
import cors from "cors";
import cookieParser from "cookie-parser";
import { verifyIDToken } from "./auth/authenticateToken";
import path from "path";

export const app = express();

declare global {
  interface R_ERROR {
    status: number;
    text: string;
  }
}

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));
app.use(cookieParser());
app.use(express.json());
app.use("/race", raceRouter);
app.use("/stats", statsRouter);
app.use("/leaderboard", leaderboardRouter);
app.use("/user", verifyIDToken, userRouter);
app.use("/improvement", verifyIDToken, improvementRouter);
app.use((err: any, req: any, res: any, next: any) => {
  res.status(err.status || 500).send(err.text || "Something went wrong");
});

console.log(process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  const buildDir = path.join(__dirname, "..", "client", "build");
  console.log(buildDir);

  app.use(express.static(buildDir));

  app.get("*", (req, res) => {
    res.sendFile(path.join(buildDir, "index.html"));
  });
}
