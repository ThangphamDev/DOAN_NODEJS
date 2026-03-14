const userService = require("@/services/admin/userService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const { sendSuccess } = require("@/utils/response");

class AdminUserController {
  constructor(service) {
    this.service = service;
    this.listUsers = this.listUsers.bind(this);
    this.lockUser = this.lockUser.bind(this);
  }

  async listUsers(req, res, next) {
    try {
      const users = await this.service.listUsers();
      return sendSuccess(res, { data: users });
    } catch (error) {
      return next(error);
    }
  }

  async lockUser(req, res, next) {
    try {
      const result = await this.service.lockUser(req.params.id);
      return sendSuccess(res, {
        status: result.status,
        message: result.data?.message || "Success",
        data: result.data,
      });
    } catch (error) {
      return next(error);
    }
  }

  registerRoutes(app, prefix = "/api") {
    app.get(`${prefix}/admin/users`, authenticate, authorize("admin"), this.listUsers);
    app.patch(`${prefix}/admin/users/:id/lock`, authenticate, authorize("admin"), this.lockUser);
  }
}

module.exports = new AdminUserController(userService);
