import rateLimit, { ipKeyGenerator } from "express-rate-limit";

interface RateLimiterOptions {
	maxRequests: number;
	windowMs: number;
}

export const rateLimiter = ({ maxRequests, windowMs }: RateLimiterOptions) => {
	return rateLimit({
		windowMs,
		max: maxRequests,
		message: "Превышен лимит запросов, пожалуйста, повторите попытку позже",
		standardHeaders: true,
		legacyHeaders: false,
		keyGenerator: (req) => {
			if (req.body?.email) {
				return req.body.email;
			}

			return req.ip ? ipKeyGenerator(req.ip) : "unknown";
		},
	});
};

export const passwordResetRequestLimiter = rateLimiter({
	maxRequests: 3,
	windowMs: 60 * 1000,
});
export const passwordResetVerifyLimiter = rateLimiter({
	maxRequests: 3,
	windowMs: 60 * 1000,
});
export const passwordResetResetLimiter = rateLimiter({
	maxRequests: 3,
	windowMs: 15 * 60 * 1000,
});
