const { Sequelize } = require("sequelize");
const mysql = require("mysql2/promise");

const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbPort = Number(process.env.DB_PORT || 3306);
const dbName = process.env.DB_NAME || "rental_platform";
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";

const sequelize = new Sequelize(
  dbName,
  dbUser,
  dbPassword,
  {
    host: dbHost,
    port: dbPort,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      charset: "utf8mb4",
    },
  }
);

const ensureDatabaseExists = async () => {
  const shouldAutoCreate = String(process.env.DB_AUTO_CREATE || "true") === "true";
  if (!shouldAutoCreate) {
    return;
  }

  const escapedDbName = dbName.replace(/`/g, "``");
  const connection = await mysql.createConnection({
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
  });

  try {
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${escapedDbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
  } finally {
    await connection.end();
  }
};

module.exports = {
  sequelize,
  ensureDatabaseExists,
};