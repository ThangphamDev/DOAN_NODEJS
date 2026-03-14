const userRepository = require("@/repositories/userRepository");
const ApiError = require("@/utils/ApiError");

class AdminUserService {
  constructor(repository) {
    this.repository = repository;
  }

  async listUsers() {
    return this.repository.getList({
      attributes: ["id", "fullName", "email", "role", "isActive", "createdAt"],
      order: [["createdAt", "DESC"]],
    });
  }

  async lockUser(userId, options = {}) {
    const user = await this.repository.getById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role === "admin") {
      throw new ApiError(400, "Cannot lock admin");
    }

    await this.repository.updateById(userId, { isActive: false }, options);

    return { message: "User locked" };
  }
}

module.exports = new AdminUserService(userRepository);
