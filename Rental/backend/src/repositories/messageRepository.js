const { Message } = require("@/entities");

class MessageRepository {
  constructor(messageEntity) {
    this.messageEntity = messageEntity;
  }

  getList(query) {
    return this.messageEntity.findAll(query);
  }

  insert(payload, options = {}) {
    return this.messageEntity.create(payload, options);
  }
}

module.exports = new MessageRepository(Message);
