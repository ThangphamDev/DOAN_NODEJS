const { UserBlock } = require("@/entities");

class UserBlockRepository {
  constructor(userBlockEntity) {
    this.userBlockEntity = userBlockEntity;
  }

  getOne(query) {
    return this.userBlockEntity.findOne(query);
  }

  getList(query) {
    return this.userBlockEntity.findAll(query);
  }

  insert(payload, options = {}) {
    return this.userBlockEntity.create(payload, options);
  }

  deleteWhere(where, options = {}) {
    return this.userBlockEntity.destroy({ where, ...options });
  }
}

module.exports = new UserBlockRepository(UserBlock);
