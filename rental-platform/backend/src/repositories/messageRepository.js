const { Message } = require("@/entities");

class MessageRepository {
  constructor(messageEntity) {
    this.messageEntity = messageEntity;
  }

  getList(query) {
    return this.messageEntity.findAll(query);
  }

  insert(payload) {
    return this.messageEntity.create(payload);
  }
}

module.exports = new MessageRepository(Message);
