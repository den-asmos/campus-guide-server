import { ClassroomRepository } from "./classroom.repository";
import { DirectionRepository } from "./direction.repository";
import { PasswordResetRepository } from "./password-reset.repository";
import { TimetableFileRepository } from "./timetable-file.repository";
import { TimetableScraperRepository } from "./timetable-scraper.repository";
import { UserRepository } from "./user.repository";

export const classroomRepository = new ClassroomRepository();
export const directionRepository = new DirectionRepository();
export const passwordResetRepository = new PasswordResetRepository();
export const timetableFileRepository = new TimetableFileRepository();
export const timetableScraperRepository = new TimetableScraperRepository();
export const userRepository = new UserRepository();
