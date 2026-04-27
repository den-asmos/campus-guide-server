export class AppError extends Error {
	constructor(
		public message: string,
		public statusCode: number = 500,
		public code?: string,
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class UnauthorizedError extends AppError {
	constructor(message: string) {
		super(message, 401, "UNAUTHORIZED");
	}
}

export class NotFoundError extends AppError {
	constructor(message: string) {
		super(message, 404, "NOT_FOUND");
	}
}

export class ConflictError extends AppError {
	constructor(message: string) {
		super(message, 409, "CONFLICT");
	}
}

export type FieldError = { field: string; message: string };

export class RequestValidationError extends AppError {
	constructor(
		message: string,
		public fields: FieldError[],
	) {
		super(message, 400, "VALIDATION_ERROR");
	}
}
