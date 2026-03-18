const { Review } = require("@/entities");

class ReviewRepository {
  constructor(reviewEntity) {
    this.reviewEntity = reviewEntity;
  }

  getOne(query) {
    return this.reviewEntity.findOne(query);
  }

  getById(id) {
    return this.reviewEntity.findByPk(id);
  }

  updateById(id, payload, options = {}) {
    return this.reviewEntity.update(payload, { where: { id }, ...options });
  }

  getList(query) {
    return this.reviewEntity.findAll(query);
  }

  insert(payload, options = {}) {
    return this.reviewEntity.create(payload, options);
  }
}

module.exports = new ReviewRepository(Review);
