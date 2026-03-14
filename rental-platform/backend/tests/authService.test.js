jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("@/utils/token", () => ({
  signToken: jest.fn(() => "mock-token"),
}));

const bcrypt = require("bcryptjs");
const authService = require("@/services/authService");

describe("AuthService", () => {
  beforeEach(() => {
    authService.repository = {
      getOne: jest.fn(),
      insert: jest.fn(),
      getById: jest.fn(),
    };
    jest.clearAllMocks();
  });

  test("register returns 409 when email exists", async () => {
    authService.repository.getOne.mockResolvedValue({ id: 1 });

    const result = await authService.register({
      fullName: "A",
      email: "a@test.com",
      password: "123456",
    });

    expect(result.status).toBe(409);
  });

  test("login returns 200 with token when credentials valid", async () => {
    authService.repository.getOne.mockResolvedValue({
      id: 1,
      role: "customer",
      isActive: true,
      passwordHash: "hashed",
      fullName: "User",
      email: "u@test.com",
    });
    bcrypt.compare.mockResolvedValue(true);

    const result = await authService.login({
      email: "u@test.com",
      password: "123456",
    });

    expect(result.status).toBe(200);
    expect(result.data.token).toBe("mock-token");
  });
});
