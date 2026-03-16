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

  insert(payload, options = {}) {
    return this.favoriteEntity.create(payload, options);
  }

  deleteById(id, options = {}) {
    return this.favoriteEntity.destroy({ where: { id }, ...options });
  }
}

module.exports = new FavoriteRepository(Favorite);
