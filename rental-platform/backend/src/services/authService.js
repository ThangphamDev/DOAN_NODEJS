const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const { toPublicUserModel } = require("@/models");
const userRepository = require("@/repositories/userRepository");
const { signToken } = require("@/utils/token");

class AuthService {
  constructor(repository) {
    this.repository = repository;
  }

  async register({ fullName, email, password, role = "customer", phone, area }, options = {}) {
    if (!fullName || !email || !password) {
      return { status: 400, data: { message: "Missing required fields" } };
    }

    if (!["customer", "landlord"].includes(role)) {
      return { status: 400, data: { message: "Invalid role" } };
    }

    const exists = await this.repository.getOne({
      where: {
        email: {
          [Op.eq]: email.toLowerCase(),
        },
      },
    });

    if (exists) {
      return { status: 409, data: { message: "Email already exists" } };
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

    return {
      status: 201,
      data: {
        token,
        user: toPublicUserModel(user),
      },
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      return { status: 400, data: { message: "Missing email or password" } };
    }

    const user = await this.repository.getOne({ where: { email: email.toLowerCase() } });

    if (!user || !user.isActive) {
      return { status: 401, data: { message: "Invalid credentials" } };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return { status: 401, data: { message: "Invalid credentials" } };
    }

    const token = signToken({ id: user.id, role: user.role });

    return {
      status: 200,
      data: {
        token,
        user: toPublicUserModel(user),
      },
    };
  }

  async getMe(userId) {
    const user = await this.repository.getById(userId);

    if (!user) {
      return { status: 404, data: { message: "User not found" } };
    }

    return {
      status: 200,
      data: {
        user: toPublicUserModel(user),
      },
    };
  }
}

module.exports = new AuthService(userRepository);
