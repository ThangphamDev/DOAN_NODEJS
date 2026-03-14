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

  insert(payload) {
    return this.reviewEntity.create(payload);
  }
}

module.exports = new ReviewRepository(Review);
