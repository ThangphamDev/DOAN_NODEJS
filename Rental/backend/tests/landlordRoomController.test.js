jest.mock("@/services/landlord/roomService", () => ({
  createRoom: jest.fn(),
  updateRoom: jest.fn(),
  listMyRooms: jest.fn(),
  removeRoom: jest.fn(),
}));

jest.mock("@/utils/transaction", () => ({
  runInTransaction: jest.fn(),
}));

jest.mock("@/utils/upload", () => {
  const upload = {
    array: jest.fn(() => "upload-middleware"),
  };

  upload.removeUploadedFiles = jest.fn().mockResolvedValue(undefined);
  return upload;
});

const controller = require("@/controllers/landlord/roomController");
const roomService = require("@/services/landlord/roomService");
const { runInTransaction } = require("@/utils/transaction");
const upload = require("@/utils/upload");

describe("LandlordRoomController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("removes uploaded files when createRoom transaction fails", async () => {
    const error = new Error("DB failed");
    runInTransaction.mockRejectedValue(error);

    const req = {
      user: { id: 7 },
      body: { title: "Room A" },
      files: [{ filename: "broken-upload.jpg" }],
    };
    const res = {};
    const next = jest.fn();

    await controller.createRoom(req, res, next);

    expect(upload.removeUploadedFiles).toHaveBeenCalledWith(req.files);
    expect(next).toHaveBeenCalledWith(error);
    expect(roomService.createRoom).not.toHaveBeenCalled();
  });

  test("removes uploaded files when updateRoom transaction fails", async () => {
    const error = new Error("DB failed");
    runInTransaction.mockRejectedValue(error);

    const req = {
      params: { id: 1 },
      user: { id: 7 },
      body: { title: "Room A" },
      files: [{ filename: "broken-upload.jpg" }],
    };
    const res = {};
    const next = jest.fn();

    await controller.updateRoom(req, res, next);

    expect(upload.removeUploadedFiles).toHaveBeenCalledWith(req.files);
    expect(next).toHaveBeenCalledWith(error);
    expect(roomService.updateRoom).not.toHaveBeenCalled();
  });
});
