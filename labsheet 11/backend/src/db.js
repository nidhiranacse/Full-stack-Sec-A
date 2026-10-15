// Author: Radha Pandey, CSE - CampusConnect
const { Sequelize, DataTypes } = require('sequelize');
const config = require('./config');

const sequelize = config.databaseUrl
  ? new Sequelize(config.databaseUrl, {
      dialect: 'postgres',
      logging: false,
      dialectOptions: config.dbSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    })
  : new Sequelize({ dialect: 'sqlite', storage: config.sqliteStorage, logging: false });

const User = sequelize.define(
  'User',
  {
    name: { type: DataTypes.STRING(80), allowNull: false },
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'student' },
  },
  { tableName: 'users' }
);

const Event = sequelize.define(
  'Event',
  {
    title: { type: DataTypes.STRING(120), allowNull: false },
    description: { type: DataTypes.TEXT },
    category: { type: DataTypes.STRING(20), allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
    venue: { type: DataTypes.STRING(120), allowNull: false },
    capacity: { type: DataTypes.INTEGER, allowNull: false },
    createdBy: { type: DataTypes.INTEGER },
  },
  {
    tableName: 'events',
    // indexes used by search / filter / sort queries
    indexes: [{ fields: ['date'] }, { fields: ['category', 'date'] }, { fields: ['title'] }],
  }
);

const Registration = sequelize.define(
  'Registration',
  {},
  {
    tableName: 'registrations',
    indexes: [{ unique: true, fields: ['userId', 'eventId'] }, { fields: ['eventId'] }],
  }
);

const Resource = sequelize.define(
  'Resource',
  {
    title: { type: DataTypes.STRING(120), allowNull: false },
    subject: { type: DataTypes.STRING(80), allowNull: false },
    semester: { type: DataTypes.INTEGER, allowNull: false },
    filename: { type: DataTypes.STRING, allowNull: false },
    originalName: { type: DataTypes.STRING, allowNull: false },
    mimeType: { type: DataTypes.STRING },
    size: { type: DataTypes.INTEGER },
    uploadedBy: { type: DataTypes.INTEGER },
  },
  { tableName: 'resources', indexes: [{ fields: ['subject', 'semester'] }] }
);

User.hasMany(Registration, { foreignKey: { name: 'userId', allowNull: false }, onDelete: 'CASCADE' });
Registration.belongsTo(User, { foreignKey: { name: 'userId', allowNull: false } });
Event.hasMany(Registration, { foreignKey: { name: 'eventId', allowNull: false }, onDelete: 'CASCADE' });
Registration.belongsTo(Event, { foreignKey: { name: 'eventId', allowNull: false } });

module.exports = { sequelize, User, Event, Registration, Resource };
