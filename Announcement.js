const { Schema, model } = require('mongoose');
module.exports = model('Announcement', new Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true }));
