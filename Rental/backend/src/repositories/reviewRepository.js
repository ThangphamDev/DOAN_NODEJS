const { Review } = require("@/entities");

class ReviewRepository {
  constructor(reviewEntity) {
    this.reviewEntity = reviewEntity;
  }

  getOne(query) {
    return this.reviewEntity.findOne(query);
  }

  getList(query) {
    return this.reviewEntity.findAll(query);
  }

  insert(payload, options = {}) {
    return this.reviewEntity.create(payload, options);
  }
}

module.exports = new ReviewRepository(Review);
