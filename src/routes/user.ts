import { Router } from "express";
import { PasswordResetController } from "../controllers/passwordReset";
import { UserController } from "../controllers/user";
import { authenticateJwt } from "../middlewares/auth";
import { rateLimiter } from "../middlewares/rateLimiter";
import { validate } from "../middlewares/validation";
import {
	requestPasswordResetSchema,
	resetPasswordSchema,
	updateProfileSchema,
	verifyPasswordResetSchema,
} from "../schemas/user";

const router = Router();
const userController = new UserController();
const passwordResetController = new PasswordResetController();

router.put(
	"/profile",
	validate({ body: updateProfileSchema }),
	authenticateJwt,
	userController.updateProfile,
);

router.post(
	"/password-reset/request",
	validate({ body: requestPasswordResetSchema }),
	rateLimiter({ maxRequests: 3, windowMs: 60 * 1000 }),
	passwordResetController.requestReset,
);

router.post(
	"/password-reset/verify",
	validate({ body: verifyPasswordResetSchema }),
	rateLimiter({ maxRequests: 3, windowMs: 60 * 1000 }),
	passwordResetController.verifyCode,
);

router.post(
	"/password-reset/reset",
	validate({ body: resetPasswordSchema }),
	rateLimiter({ maxRequests: 3, windowMs: 15 * 60 * 1000 }),
	passwordResetController.resetPassword,
);

export default router;
