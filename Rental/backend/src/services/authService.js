const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { toPublicUserModel } = require("@/models");
const userRepository = require("@/repositories/userRepository");
const { signToken } = require("@/utils/token");
const ApiError = require("@/utils/ApiError");

class AuthService {
  constructor(repository) {
    this.repository = repository;
  }

  async register({ fullName, email, password, role = "customer", phone, area }, options = {}) {
    if (!fullName || !email || !password) {
      throw new ApiError(400, "Missing required fields");
    }

    if (!["customer", "landlord"].includes(role)) {
      throw new ApiError(400, "Invalid role");
    }

    const exists = await this.repository.getOne({
      where: { email: { [Op.eq]: email.toLowerCase() } },
    });

    if (exists) {
      throw new ApiError(409, "Email already exists");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.repository.insert({
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      role,
      phone,
      area,
    }, options);

    const token = signToken({ id: user.id, role: user.role });

    return { token, user: toPublicUserModel(user) };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new ApiError(400, "Missing email or password");
    }

    const user = await this.repository.getOne({ where: { email: email.toLowerCase() } });

    if (!user || !user.isActive) {
      throw new ApiError(401, "Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new ApiError(401, "Invalid credentials");
    }

    const token = signToken({ id: user.id, role: user.role });

    return { token, user: toPublicUserModel(user) };
  }

  async getMe(userId) {
    const user = await this.repository.getById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return { user: toPublicUserModel(user) };
  }
}

module.exports = new AuthService(userRepository);
