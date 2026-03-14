const getPagination = ({ page = 1, limit = 10 }) => {
  const normalizedPage = Number(page) > 0 ? Number(page) : 1;
  const normalizedLimit = Number(limit) > 0 ? Number(limit) : 10;

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    offset: (normalizedPage - 1) * normalizedLimit,
  };
};

module.exports = {
  getPagination,
};
