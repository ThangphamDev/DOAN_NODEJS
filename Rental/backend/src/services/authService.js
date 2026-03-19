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

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
      throw new ApiError(400, "Vui lòng nhập email và mật khẩu");
    }

    const user = await this.repository.getOne({ where: { email: email.toLowerCase() } });

    if (!user) {
      throw new ApiError(401, "Email hoặc mật khẩu không đúng");
    }

    if (!user.isActive) {
      throw new ApiError(403, "Tài khoản của bạn đã bị khóa");
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      throw new ApiError(401, "Email hoặc mật khẩu không đúng");
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

  async updateProfile(userId, { fullName, email, phone, area }, options = {}) {
    const user = await this.repository.getById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const nextFullName = fullName?.trim();
    const nextEmail = email?.trim().toLowerCase();
    const nextPhone = phone?.trim();
    const nextArea = area?.trim();

    if (!nextFullName || nextFullName.length < 2) {
      throw new ApiError(400, "Full name must be at least 2 characters");
    }

    if (!nextEmail || !this.validateEmail(nextEmail)) {
      throw new ApiError(400, "Invalid email");
    }

    if (nextPhone) {
      const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
      if (!phoneRegex.test(nextPhone)) {
        throw new ApiError(400, "Invalid phone");
      }
    }

    if (nextEmail !== user.email) {
      const existedUser = await this.repository.getOne({
        where: {
          email: { [Op.eq]: nextEmail },
        },
      });

      if (existedUser && Number(existedUser.id) !== Number(userId)) {
        throw new ApiError(409, "Email already exists");
      }
    }

    const updatePayload = {
      fullName: nextFullName,
      email: nextEmail,
      phone: nextPhone || null,
      area: nextArea || null,
    };

    await this.repository.updateById(userId, updatePayload, options);

    const updatedUser = await this.repository.getById(userId);

    return { user: toPublicUserModel(updatedUser) };
  }
}

module.exports = new AuthService(userRepository);
