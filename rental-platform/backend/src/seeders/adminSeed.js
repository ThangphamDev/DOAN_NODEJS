const bcrypt = require("bcryptjs");
const { User } = require("@/entities");

const seedDefaultAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";

  const exists = await User.findOne({ where: { email } });
  if (exists) {
    return exists;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  return User.create({
    fullName: "System Admin",
    email,
    passwordHash,
    role: "admin",
    isActive: true,
  });
};

module.exports = {
  seedDefaultAdmin,
};
