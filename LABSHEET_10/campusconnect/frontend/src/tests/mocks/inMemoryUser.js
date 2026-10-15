const users = [];

function createUser(data) {
  const user = {
    _id: String(users.length + 1),
    ...data,
    refreshTokenVersion: 0,
  };

  users.push(user);
  return user;
}

function findUserByEmail(email) {
  return users.find((user) => user.email === email);
}

function findUserById(id) {
  return users.find((user) => user._id === id);
}

function clearUsers() {
  users.length = 0;
}

module.exports = {
  users,
  createUser,
  findUserByEmail,
  findUserById,
  clearUsers,
};