import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Event description is required']
    },
    date: {
      type: Date,
      required: [true, 'Event date and time is required']
    },
    location: {
      type: String,
      required: [true, 'Location or venue is required'],
      trim: true
    },
    category: {
      type: String,
      enum: ['ACADEMIC', 'CULTURAL', 'SPORTS', 'WORKSHOP', 'SEMINAR', 'GENERAL'],
      default: 'GENERAL'
    },
    capacity: {
      type: Number,
      required: [true, 'Event capacity is required'],
      min: [1, 'Capacity must be at least 1']
    },
    rsvpUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual for remaining spots
eventSchema.virtual('spotsLeft').get(function () {
  return Math.max(0, this.capacity - (this.rsvpUsers ? this.rsvpUsers.length : 0));
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

export const Event = mongoose.model('Event', eventSchema);
