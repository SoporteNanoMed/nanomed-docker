const AppDataSource = require("./typeorm-config");

class BaseRepository {
  constructor(entity) {
    this.entity = entity;
    this.repository = null;
  }

  async getRepository() {
    if (!this.repository) {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      this.repository = AppDataSource.getRepository(this.entity);
    }
    return this.repository;
  }

  async findAll(options = {}) {
    const repository = await this.getRepository();
    return await repository.find(options);
  }

  async findOne(conditions, options = {}) {
    const repository = await this.getRepository();
    return await repository.findOne({ where: conditions, ...options });
  }

  async findById(id, options = {}) {
    const repository = await this.getRepository();
    return await repository.findOne({ where: { id }, ...options });
  }

  async create(data) {
    const repository = await this.getRepository();
    const entity = repository.create(data);
    return await repository.save(entity);
  }

  async update(id, data) {
    const repository = await this.getRepository();
    await repository.update(id, data);
    return await this.findById(id);
  }

  async delete(id) {
    const repository = await this.getRepository();
    return await repository.delete(id);
  }

  async count(conditions = {}) {
    const repository = await this.getRepository();
    return await repository.count({ where: conditions });
  }

  async query(sql, parameters = []) {
    const repository = await this.getRepository();
    return await repository.query(sql, parameters);
  }
}

module.exports = BaseRepository;
