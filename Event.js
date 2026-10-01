const { Schema, model } = require('mongoose');
const eventSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  date: { type: Date, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rsvps: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });
module.exports = model('Event', eventSchema);
