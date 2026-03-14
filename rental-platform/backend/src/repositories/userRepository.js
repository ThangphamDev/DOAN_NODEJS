const { User } = require("@/entities");

class UserRepository {
  constructor(userEntity) {
    this.userEntity = userEntity;
  }

  getOne(query) {
    return this.userEntity.findOne(query);
  }

  insert(payload, options = {}) {
    return this.userEntity.create(payload, options);
  }

  getById(id) {
    return this.userEntity.findByPk(id);
  }

  getList(query) {
    return this.userEntity.findAll(query);
  }

  updateById(id, payload, options = {}) {
    return this.userEntity.update(payload, { where: { id }, ...options });
  }
}

module.exports = new UserRepository(User);
