import { DirectionRepository } from "../repositories/direction";

export class DirectionService {
	private directionRepository: DirectionRepository;

	constructor() {
		this.directionRepository = new DirectionRepository();
	}

	getDirection = async (data: { origin: string; destination: string }) => {
		return await this.directionRepository.findDirection(data);
	};
}
