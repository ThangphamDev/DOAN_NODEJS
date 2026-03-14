const { User } = require("@/entities");

class UserRepository {
  constructor(userEntity) {
    this.userEntity = userEntity;
  }

  getOne(query) {
    return this.userEntity.findOne(query);
  }

  insert(payload) {
    return this.userEntity.create(payload);
  }

  getById(id) {
    return this.userEntity.findByPk(id);
  }

  getList(query) {
    return this.userEntity.findAll(query);
  }

  updateById(id, payload) {
    return this.userEntity.update(payload, { where: { id } });
  }
}

module.exports = new UserRepository(User);
