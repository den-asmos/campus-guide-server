import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import passport from "passport";
import "./config/passport";
import authRoutes from "./routes/auth";
import classroomRoutes from "./routes/classroom";
import timetableRoutes from "./routes/timetable";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api/timetable", timetableRoutes);
app.use("/api/classroom", classroomRoutes);
app.use("/api/auth", authRoutes);

export default app;
