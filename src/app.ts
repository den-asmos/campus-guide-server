import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import passport from "passport";
import { configurePassport } from "./config/passport/index";
import { errorMiddleware } from "./middlewares/error.middleware";
import { userRepository } from "./repositories";
import authRoutes from "./routes/auth.routes";
import classroomRoutes from "./routes/classroom.routes";
import directionRoutes from "./routes/direction.routes";
import timetableRoutes from "./routes/timetable.routes";
import userRoutes from "./routes/user.routes";

dotenv.config();

const app = express();
app.use(
	cors({
		origin: "*",
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

configurePassport(userRepository);

app.use("/api/timetable", timetableRoutes);
app.use("/api/classroom", classroomRoutes);
app.use("/api/direction", directionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.use(errorMiddleware);

export default app;
