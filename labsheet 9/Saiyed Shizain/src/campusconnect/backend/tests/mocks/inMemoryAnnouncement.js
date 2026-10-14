// In-memory Announcement stand-in for Jest.
let store = [];
let seq = 1;

const Announcement = {
  async create(data) {
    const doc = { _id: String(seq++), createdAt: new Date(), ...data };
    store.push(doc);
    return { ...doc };
  },
  find() {
    const rows = store.slice().sort((a, b) => b.createdAt - a.createdAt);
    const q = {
      sort() { return this; },
      limit(n) { this._n = n; return this; },
      lean() { return Promise.resolve(rows.slice(0, this._n || 50).map((r) => ({ ...r }))); },
    };
    return q;
  },
  __reset() {
    store = [];
    seq = 1;
  },
};

module.exports = Announcement;
