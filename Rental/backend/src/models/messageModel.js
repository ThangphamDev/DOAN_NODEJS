const toMessageModel = (message) => {
  if (!message) return null;

  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    roomId: message.roomId,
    content: message.content,
    createdAt: message.createdAt,
  };
};

module.exports = {
  toMessageModel,
};
