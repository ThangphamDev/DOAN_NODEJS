class ApiResponse {
  constructor(data = null, message = "Success", meta = null) {
    this.success = true;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }
}

module.exports = ApiResponse;
