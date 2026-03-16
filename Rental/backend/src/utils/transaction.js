const { sequelize } = require("@/entities");

const runInTransaction = (executor) => {
  return sequelize.transaction(async (tx) => executor(tx));
};

module.exports = {
  runInTransaction,
};
