import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authenticateJwt } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { userRepository } from "../repositories";
import { signInSchema, signUpSchema } from "../schemas/auth.schema";
import { AuthService } from "../services/auth.service";
import { TokenService } from "../services/token.service";

const router = Router();

const authService = new AuthService(userRepository, new TokenService());
const authController = new AuthController(authService);

router.post(
	"/sign-up",
	validate({ body: signUpSchema }),
	authController.signUp,
);
router.post(
	"/sign-in",
	validate({ body: signInSchema }),
	authController.signIn,
);
router.get("/current", authenticateJwt, authController.getCurrent);

export default router;
