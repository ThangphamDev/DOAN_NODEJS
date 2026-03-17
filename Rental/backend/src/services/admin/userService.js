const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { toPublicUserModel } = require("@/models");
const userRepository = require("@/repositories/userRepository");
const ApiError = require("@/utils/ApiError");

class AdminUserService {
  constructor(repository) {
    this.repository = repository;
  }

  async listUsers() {
    const users = await this.repository.getList({
      order: [["createdAt", "DESC"]],
    });

    return users.map(toPublicUserModel);
  }

  async getUserDetail(userId) {
    const user = await this.repository.getById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return toPublicUserModel(user);
  }

  async createUser(payload, options = {}) {
    const { fullName, email, password, role = "customer", phone, area } = payload;
    const normalizedName = String(fullName || "").trim();
    const normalizedEmail = String(email || "").toLowerCase().trim();

    if (!normalizedName || !normalizedEmail || !password) {
      throw new ApiError(400, "Missing required fields");
    }

    if (!["customer", "landlord", "admin"].includes(role)) {
      throw new ApiError(400, "Invalid role");
    }
    
    const exists = await this.repository.getOne({
      where: { email: { [Op.eq]: normalizedEmail } },
    });

    if (exists) {
      throw new ApiError(409, "Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.repository.insert(
      {
        fullName: normalizedName,
        email: normalizedEmail,
        passwordHash,
        role,
        phone: phone ? String(phone).trim() : null,
        area: area ? String(area).trim() : null,
      },
      options
    );

    return {
      message: "User created",
      user: toPublicUserModel(user),
    };
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

  async unlockUser(userId, options = {}) {
    const user = await this.repository.getById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.role === "admin") {
      throw new ApiError(400, "Admin account is always active");
    }

    await this.repository.updateById(userId, { isActive: true }, options);

    return { message: "User unlocked" };
  }
}

module.exports = new AdminUserService(userRepository);
