const { Favorite } = require("@/entities");

class FavoriteRepository {
  constructor(favoriteEntity) {
    this.favoriteEntity = favoriteEntity;
  }

  getOne(query) {
    return this.favoriteEntity.findOne(query);
  }

  getList(query) {
    return this.favoriteEntity.findAll(query);
  }

  insert(payload) {
    return this.favoriteEntity.create(payload);
  }

  deleteById(id) {
    return this.favoriteEntity.destroy({ where: { id } });
  }
}

module.exports = new FavoriteRepository(Favorite);
