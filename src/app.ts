import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import passport from "passport";
import "./config/passport";
import authRoutes from "./routes/auth";
import classroomRoutes from "./routes/classroom";
import directionRoutes from "./routes/direction";
import timetableRoutes from "./routes/timetable";
import userRoutes from "./routes/user";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

app.use("/api/timetable", timetableRoutes);
app.use("/api/classroom", classroomRoutes);
app.use("/api/direction", directionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

export default app;
