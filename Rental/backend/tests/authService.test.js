jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("@/utils/token", () => ({
  signToken: jest.fn(() => "mock-token"),
}));

const bcrypt = require("bcryptjs");
const authService = require("@/services/authService");
const ApiError = require("@/utils/ApiError");

describe("AuthService", () => {
  beforeEach(() => {
    authService.repository = {
      getOne: jest.fn(),
      insert: jest.fn(),
      getById: jest.fn(),
      updateById: jest.fn(),
    };
    jest.clearAllMocks();
  });

  // ─── register ────────────────────────────────────────────────────────────
  describe("register", () => {
    test("FAIL – throws 400 when required fields missing", async () => {
      await expect(
        authService.register({ email: "a@test.com", password: "123" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("FAIL – throws 400 when role invalid", async () => {
      authService.repository.getOne.mockResolvedValue(null);
      await expect(
        authService.register({ fullName: "A", email: "a@test.com", password: "123", role: "hacker" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    test("FAIL – throws 409 when email already exists", async () => {
      authService.repository.getOne.mockResolvedValue({ id: 1 });
      await expect(
        authService.register({ fullName: "A", email: "a@test.com", password: "123456" })
      ).rejects.toMatchObject({ statusCode: 409 });
      // insert must NOT have been called (simulate rollback gate)
      expect(authService.repository.insert).not.toHaveBeenCalled();
    });

    test("ROLLBACK – throws when DB insert fails, insert was attempted", async () => {
      authService.repository.getOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed");
      authService.repository.insert.mockRejectedValue(new Error("DB error"));

      await expect(
        authService.register({ fullName: "A", email: "new@test.com", password: "123456" })
      ).rejects.toThrow("DB error");
      // insert was called → transaction wrapper (runInTransaction) would rollback
      expect(authService.repository.insert).toHaveBeenCalledTimes(1);
    });

    test("PASS – returns token and user on success", async () => {
      authService.repository.getOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed");
      authService.repository.insert.mockResolvedValue({
        id: 1, fullName: "A", email: "a@test.com", role: "customer",
        phone: null, area: null, isActive: true, createdAt: new Date(),
      });

      const result = await authService.register({
        fullName: "A", email: "a@test.com", password: "123456",
      });

      expect(result.token).toBe("mock-token");
      expect(result.user.email).toBe("a@test.com");
    });
  });

  // ─── login ────────────────────────────────────────────────────────────────
  describe("login", () => {
    test("FAIL – throws 400 when fields missing", async () => {
      await expect(authService.login({ email: "a@test.com" })).rejects.toMatchObject({ statusCode: 400 });
    });

    test("FAIL – throws 401 when user not found", async () => {
      authService.repository.getOne.mockResolvedValue(null);
      await expect(authService.login({ email: "x@test.com", password: "123" }))
        .rejects.toMatchObject({ statusCode: 401 });
    });

    test("FAIL – throws 401 when account inactive", async () => {
      authService.repository.getOne.mockResolvedValue({ id: 1, isActive: false });
      await expect(authService.login({ email: "x@test.com", password: "123" }))
        .rejects.toMatchObject({ statusCode: 401 });
    });

    test("FAIL – throws 401 when password wrong", async () => {
      authService.repository.getOne.mockResolvedValue({
        id: 1, isActive: true, passwordHash: "hashed",
      });
      bcrypt.compare.mockResolvedValue(false);
      await expect(authService.login({ email: "x@test.com", password: "wrong" }))
        .rejects.toMatchObject({ statusCode: 401 });
    });

    test("PASS – returns token and user", async () => {
      authService.repository.getOne.mockResolvedValue({
        id: 1, role: "customer", isActive: true, passwordHash: "hashed",
        fullName: "User", email: "u@test.com",
      });
      bcrypt.compare.mockResolvedValue(true);

      const result = await authService.login({ email: "u@test.com", password: "123456" });

      expect(result.token).toBe("mock-token");
      expect(result.user).toBeDefined();
    });
  });

  // ─── getMe ────────────────────────────────────────────────────────────────
  describe("getMe", () => {
    test("FAIL – throws 404 when user not found", async () => {
      authService.repository.getById.mockResolvedValue(null);
      await expect(authService.getMe(999)).rejects.toMatchObject({ statusCode: 404 });
    });

    test("PASS – returns user data", async () => {
      authService.repository.getById.mockResolvedValue({
        id: 1, fullName: "A", email: "a@test.com", role: "customer",
        phone: null, area: null, isActive: true, createdAt: new Date(),
      });
      const result = await authService.getMe(1);
      expect(result.user.email).toBe("a@test.com");
    });
  });

  describe("updateProfile", () => {
    test("FAIL – throws 404 when user not found", async () => {
      authService.repository.getById.mockResolvedValue(null);
      await expect(authService.updateProfile(999, { fullName: "A B", email: "a@test.com" })).rejects.toMatchObject({ statusCode: 404 });
    });

    test("FAIL – throws 400 when fullName invalid", async () => {
      authService.repository.getById.mockResolvedValue({ id: 1, email: "old@test.com" });
      await expect(authService.updateProfile(1, { fullName: "A", email: "a@test.com" })).rejects.toMatchObject({ statusCode: 400 });
    });

    test("FAIL – throws 409 when email already exists", async () => {
      authService.repository.getById.mockResolvedValue({ id: 1, email: "old@test.com" });
      authService.repository.getOne.mockResolvedValue({ id: 2, email: "new@test.com" });

      await expect(
        authService.updateProfile(1, { fullName: "Alice Nguyen", email: "new@test.com", phone: "0912345678" })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    test("PASS – updates and returns public user", async () => {
      authService.repository.getById
        .mockResolvedValueOnce({ id: 1, email: "old@test.com" })
        .mockResolvedValueOnce({
          id: 1,
          fullName: "Alice Nguyen",
          email: "alice@test.com",
          role: "customer",
          phone: "0912345678",
          area: "Quận 7",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      const result = await authService.updateProfile(1, {
        fullName: "Alice Nguyen",
        email: "alice@test.com",
        phone: "0912345678",
        area: "Quận 7",
      });

      expect(authService.repository.updateById).toHaveBeenCalledWith(
        1,
        {
          fullName: "Alice Nguyen",
          email: "alice@test.com",
          phone: "0912345678",
          area: "Quận 7",
        },
        expect.any(Object)
      );
      expect(result.user.fullName).toBe("Alice Nguyen");
    });
  });
});
