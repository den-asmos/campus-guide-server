import { Model, ModelStatic, WhereOptions } from "sequelize";

export class BaseRepository<T extends Model> {
	constructor(protected model: ModelStatic<T>) {}

	async findAll(where?: WhereOptions): Promise<T[]> {
		return this.model.findAll({ where });
	}

	async findById(id: number): Promise<T | null> {
		return this.model.findByPk(id);
	}

	async delete(id: number): Promise<number> {
		return this.model.destroy({ where: { id } as WhereOptions });
	}
}
