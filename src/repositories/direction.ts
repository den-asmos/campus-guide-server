import { findPath } from "../graph/findPath";

export class DirectionRepository {
	findDirection = async ({
		origin,
		destination,
	}: {
		origin: string;
		destination: string;
	}) => {
		return await findPath(origin, destination);
	};
}
