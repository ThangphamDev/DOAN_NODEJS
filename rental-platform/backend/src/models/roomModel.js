const toRoomListModel = (room) => ({
  id: room.id,
  title: room.title,
  price: room.price,
  area: room.area,
  address: room.address,
  status: room.status,
  images: room.images || [],
  createdAt: room.createdAt,
});

module.exports = {
  toRoomListModel,
};
