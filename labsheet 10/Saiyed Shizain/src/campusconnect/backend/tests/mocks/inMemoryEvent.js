// In-memory Event stand-in supporting filter/sort/skip/limit/lean chains.
let store = [];
let seq = 1;

function matches(doc, filter) {
  if (filter.title && filter.title.$regex) {
    const re = new RegExp(filter.title.$regex, filter.title.$options || "");
    if (!re.test(doc.title)) return false;
  }
  return true;
}

function chain(rows) {
  const q = {
    _rows: rows.slice(),
    sort(spec) {
      const [[key, dir]] = Object.entries(spec);
      this._rows.sort((a, b) => {
        const av = a[key] instanceof Date ? a[key].getTime() : a[key];
        const bv = b[key] instanceof Date ? b[key].getTime() : b[key];
        return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
      });
      return this;
    },
    skip(n) {
      this._rows = this._rows.slice(n);
      return this;
    },
    limit(n) {
      this._rows = this._rows.slice(0, n);
      return this;
    },
    lean() {
      return Promise.resolve(this._rows.map((r) => ({ ...r })));
    },
  };
  return q;
}

const Event = {
  async create(data) {
    const doc = {
      _id: String(seq++),
      attendees: [],
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
      save: async function () {
        return this;
      },
    };
    store.push(doc);
    return { ...doc };
  },
  find(filter = {}) {
    return chain(store.filter((d) => matches(d, filter)));
  },
  async countDocuments(filter = {}) {
    return store.filter((d) => matches(d, filter)).length;
  },
  async findById(id) {
    const doc = store.find((d) => d._id === String(id));
    if (!doc) return null;
    if (typeof doc.save !== "function") {
      doc.save = async function () {
        return this;
      };
    }
    return doc;
  },
  __reset() {
    store = [];
    seq = 1;
  },
};

module.exports = Event;
