const bcrypt = require('bcrypt');
const { users } = require('./mockDb');

class UserDoc {
  constructor(data) {
    Object.assign(this, data);
  }
  async comparePassword(password) {
    return await bcrypt.compare(password, this.passwordHash);
  }
}

const User = {
  findOne: async (query) => {
    const data = await users.findOne(query);
    return data ? new UserDoc(data) : null;
  },
  findById: async (id) => {
    const data = await users.findById(id);
    return data ? new UserDoc(data) : null;
  },
  create: async (obj) => {
    const hashed = await bcrypt.hash(obj.passwordHash, 10);
    const data = await users.create({ ...obj, passwordHash: hashed });
    return new UserDoc(data);
  }
};

module.exports = User;
