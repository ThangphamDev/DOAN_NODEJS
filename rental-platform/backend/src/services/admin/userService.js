const userRepository = require("@/repositories/userRepository");

class AdminUserService {
  constructor(repository) {
    this.repository = repository;
  }

  async listUsers() {
    const users = await this.repository.getList({
      attributes: ["id", "fullName", "email", "role", "isActive", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    return users;
  }

  async lockUser(userId, options = {}) {
    const user = await this.repository.getById(userId);

    if (!user) {
      return { status: 404, data: { message: "User not found" } };
    }

    if (user.role === "admin") {
      return { status: 400, data: { message: "Cannot lock admin" } };
    }

    await this.repository.updateById(userId, { isActive: false }, options);

    return { status: 200, data: { message: "User locked" } };
  }
}

module.exports = new AdminUserService(userRepository);
