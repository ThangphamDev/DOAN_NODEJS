const { Message } = require("@/entities");

class MessageRepository {
  constructor(messageEntity) {
    this.messageEntity = messageEntity;
  }

  getList(query) {
    return this.messageEntity.findAll(query);
  }

  getOne(query) {
    return this.messageEntity.findOne(query);
  }

  insert(payload, options = {}) {
    return this.messageEntity.create(payload, options);
  }

  updateWhere(where, payload, options = {}) {
    return this.messageEntity.update(payload, { where, ...options });
  }
}

module.exports = new MessageRepository(Message);
