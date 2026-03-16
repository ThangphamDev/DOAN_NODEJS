const toPublicUserModel = (user) => ({
  id: user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  phone: user.phone,
  area: user.area,
  isActive: user.isActive,
});

module.exports = {
  toPublicUserModel,
};
