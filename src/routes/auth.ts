import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { authenticateJwt } from "../middlewares/auth";
import { validate } from "../middlewares/validation";
import {
	signInSchema,
	signUpSchema,
} from "../schemas/auth";

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

export default router;
