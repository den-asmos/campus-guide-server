import passport from "passport";
import { UserRepository } from "../../repositories/user.repository";
import { buildJwtStrategy } from "./jwt.strategy";
import { buildLocalStrategy } from "./local.strategy";

export const configurePassport = (
	userRepository: UserRepository,
): typeof passport => {
	passport.use(buildLocalStrategy(userRepository));
	passport.use(buildJwtStrategy(userRepository));
	return passport;
};
