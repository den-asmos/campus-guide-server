import { Router } from "express";
import { PasswordResetController } from "../controllers/password-reset.controller";
import { UserController } from "../controllers/user.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/image-upload.middleware";
import {
	passwordResetRequestLimiter,
	passwordResetResetLimiter,
	passwordResetVerifyLimiter,
} from "../middlewares/rate-limiter.middleware";
import { validate } from "../middlewares/validate.middleware";
import { passwordResetRepository, userRepository } from "../repositories";
import {
	requestPasswordResetSchema,
	resetPasswordSchema,
	updateProfileSchema,
	verifyPasswordResetSchema,
} from "../schemas/user.schema";
import { CloudinaryService } from "../services/cloudinary.service";
import { EmailService } from "../services/email.service";
import { PasswordResetService } from "../services/password-reset.service";
import { UserService } from "../services/user.service";

const router = Router();

const userService = new UserService(userRepository, new CloudinaryService());
const userController = new UserController(userService);

const passwordResetService = new PasswordResetService(
	passwordResetRepository,
	userRepository,
	new EmailService(),
);
const passwordResetController = new PasswordResetController(
	passwordResetService,
);

router.put(
	"/profile",
	authenticateJwt,
	validate({ body: updateProfileSchema }),
	userController.updateProfile,
);
router.put(
	"/avatar",
	authenticateJwt,
	upload.single("avatar"),
	userController.updateAvatar,
);
router.delete("/avatar", authenticateJwt, userController.deleteAvatar);

router.post(
	"/password-reset/request",
	validate({ body: requestPasswordResetSchema }),
	passwordResetRequestLimiter,
	passwordResetController.requestReset,
);
router.post(
	"/password-reset/verify",
	validate({ body: verifyPasswordResetSchema }),
	passwordResetVerifyLimiter,
	passwordResetController.verifyCode,
);
router.post(
	"/password-reset/reset",
	validate({ body: resetPasswordSchema }),
	passwordResetResetLimiter,
	passwordResetController.resetPassword,
);

export default router;
