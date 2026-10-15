const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    department: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    date: { type: Date, required: true },
    capacity: { type: Number, default: 100 },
    venue: { type: String, required: true },
    registeredCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Compound index for accelerated filtered lookups
eventSchema.index({ department: 1, category: 1 });

module.exports = mongoose.model('Event', eventSchema);
