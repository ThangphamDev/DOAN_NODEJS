const userService = require("@/services/admin/userService");
const { authenticate } = require("@/middleware/auth");
const authorize = require("@/middleware/authorize");
const { sendSuccess } = require("@/utils/response");
const { runInTransaction } = require("@/utils/transaction");

class AdminUserController {
  constructor(service) {
    this.service = service;
    this.listUsers = this.listUsers.bind(this);
    this.getUserDetail = this.getUserDetail.bind(this);
    this.createUser = this.createUser.bind(this);
    this.lockUser = this.lockUser.bind(this);
    this.unlockUser = this.unlockUser.bind(this);
  }

  async listUsers(req, res, next) {
    try {
      const data = await this.service.listUsers();
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  async lockUser(req, res, next) {
    try {
      const data = await runInTransaction((tx) =>
        this.service.lockUser(req.params.id, { transaction: tx })
      );
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  async unlockUser(req, res, next) {
    try {
      const data = await runInTransaction((tx) =>
        this.service.unlockUser(req.params.id, { transaction: tx })
      );
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  async getUserDetail(req, res, next) {
    try {
      const data = await this.service.getUserDetail(req.params.id);
      return sendSuccess(res, { data });
    } catch (error) {
      return next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const data = await runInTransaction((tx) =>
        this.service.createUser(req.body, { transaction: tx })
      );
      return sendSuccess(res, { status: 201, data });
    } catch (error) {
      return next(error);
    }
  }

  registerRoutes(app, prefix = "/api") {
    app.get(`${prefix}/admin/users`, authenticate, authorize("admin"), this.listUsers);
    app.get(`${prefix}/admin/users/:id`, authenticate, authorize("admin"), this.getUserDetail);
    app.post(`${prefix}/admin/users`, authenticate, authorize("admin"), this.createUser);
    app.patch(`${prefix}/admin/users/:id/lock`, authenticate, authorize("admin"), this.lockUser);
    app.patch(`${prefix}/admin/users/:id/unlock`, authenticate, authorize("admin"), this.unlockUser);
  }
}

module.exports = new AdminUserController(userService);
