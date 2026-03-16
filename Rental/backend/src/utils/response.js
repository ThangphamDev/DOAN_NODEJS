const ApiResponse = require("@/utils/ApiResponse");

const sendSuccess = (res, { status = 200, message = "Success", data = null, meta = null } = {}) => {
  return res.status(status).json(new ApiResponse(data, message, meta));
};

module.exports = {
  sendSuccess,
};
