import rateLimit from "express-rate-limit";

type Options = {
	maxRequests: number;
	windowMs: number;
};

export const rateLimiter = ({ maxRequests, windowMs }: Options) => {
	return rateLimit({
		windowMs,
		max: maxRequests,
		message: "Превышен лимит запрос. Пожалуйста, повторите попытку позже",
		standardHeaders: true,
		legacyHeaders: false,
		keyGenerator: (req) => {
			return req.body.email;
		},
	});
};
