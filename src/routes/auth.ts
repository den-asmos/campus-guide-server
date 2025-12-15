import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { authenticateJwt } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import {
	signInSchema,
	signUpSchema,
	updatePasswordSchema,
	updateProfileSchema,
} from "../schemas/user";

const router = Router();
const authController = new AuthController();

router.post(
	"/sign-up",
	validate({ body: signUpSchema }),
	authController.signUp
);
router.post(
	"/sign-in",
	validate({ body: signInSchema }),
	authController.signIn
);

router.get("/current", authenticateJwt, authController.getCurrentUser);
router.put(
	"/profile",
	validate({ body: updateProfileSchema }),
	authenticateJwt,
	authController.updateProfile
);
router.put(
	"/password",
	validate({ body: updatePasswordSchema }),
	authenticateJwt,
	authController.updatePassword
);

export default router;
