// Run: npm run seed  -> creates an admin, a demo student and 14 sample events
const bcrypt = require('bcryptjs');
const { sequelize, User, Event } = require('./db');

(async () => {
  await sequelize.sync();
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@campusconnect.com').toLowerCase();
  const [admin] = await User.findOrCreate({
    where: { email: adminEmail },
    defaults: {
      name: 'Radha Pandey',
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123', 10),
      role: 'admin',
    },
  });
  await User.findOrCreate({
    where: { email: 'student@campusconnect.com' },
    defaults: { name: 'Demo Student', passwordHash: await bcrypt.hash('Student@123', 10), role: 'student' },
  });

  if ((await Event.count()) === 0) {
    const cats = ['workshop', 'hackathon', 'placement', 'seminar'];
    const day = 24 * 3600 * 1000;
    const rows = Array.from({ length: 14 }, (_, i) => ({
      title: `${['React Workshop', 'CodeSprint Hackathon', 'TCS Placement Drive', 'AI Seminar'][i % 4]} #${i + 1}`,
      description: 'Sample event created by the seed script.',
      category: cats[i % 4],
      date: new Date(Date.now() + (i + 2) * day),
      venue: `Seminar Hall ${(i % 3) + 1}`,
      capacity: 20 + i * 5,
      createdBy: admin.id,
    }));
    await Event.bulkCreate(rows);
  }
  console.log('Seed complete. Admin:', adminEmail, '| Student: student@campusconnect.com');
  process.exit(0);
})();
