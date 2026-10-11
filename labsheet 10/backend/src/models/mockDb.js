const crypto = require('crypto');
const bcrypt = require('bcrypt');

let usersData = [
  { _id: '1', name: 'Admin User', email: 'admin@campus.edu', passwordHash: null, role: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
  { _id: '2', name: 'Student User', email: 'student@campus.edu', passwordHash: null, role: 'STUDENT', createdAt: new Date(), updatedAt: new Date() }
];
let eventsData = [];
let announcementsData = [];

async function initPasswords() {
  usersData[0].passwordHash = await bcrypt.hash('admin123', 10);
  usersData[1].passwordHash = await bcrypt.hash('student123', 10);
}
initPasswords();

class MockCollection {
  constructor(getData, setData) {
    this.getData = getData;
    this.setData = setData;
  }

  async find(query = {}) {
    let data = this.getData();
    let filtered = data;
    if (query.email) filtered = filtered.filter(u => u.email === query.email);
    if (query.title && query.title.$regex) {
      const regex = new RegExp(query.title.$regex, query.title.$options || 'i');
      filtered = filtered.filter(e => regex.test(e.title));
    }
    const result = {
      skip: (num) => ({
        limit: (num2) => ({
          sort: () => Promise.resolve(filtered.slice(0, num2))
        })
      }),
      sort: () => Promise.resolve(filtered)
    };
    return result;
  }

  async findOne(query) {
    const data = this.getData();
    if (query.email) return data.find(u => u.email === query.email) || null;
    if (query._id) return data.find(u => u._id === query._id) || null;
    return null;
  }

  async findById(id) {
    const data = this.getData();
    return data.find(u => u._id === id) || null;
  }

  async create(obj) {
    const data = this.getData();
    const newObj = { ...obj, _id: crypto.randomUUID(), createdAt: new Date(), updatedAt: new Date() };
    if (!newObj.rsvps) newObj.rsvps = [];
    data.push(newObj);
    this.setData(data);
    return newObj;
  }

  async countDocuments(query = {}) {
    return this.getData().length;
  }
}

const users = new MockCollection(() => usersData, (d) => { usersData = d; });
const events = new MockCollection(() => eventsData, (d) => { eventsData = d; });
const announcements = new MockCollection(() => announcementsData, (d) => { announcementsData = d; });

module.exports = { users, events, announcements };
