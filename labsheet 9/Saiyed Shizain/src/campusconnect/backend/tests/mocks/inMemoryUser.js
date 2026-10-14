// In-memory User stand-in for Jest (no MongoDB needed).
let store = [];
let seq = 1;

function wrap(doc) {
  return doc ? { ...doc } : null;
}

const User = {
  async findOne(query) {
    return wrap(store.find((u) => u.email === query.email));
  },
  async create(data) {
    const doc = { _id: String(seq++), refreshTokenVersion: 0, ...data };
    store.push(doc);
    return wrap(doc);
  },
  async findById(id) {
    return wrap(store.find((u) => u._id === String(id)));
  },
  __reset() {
    store = [];
    seq = 1;
  },
};

module.exports = User;
