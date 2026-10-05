import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      enum: {
        values: ['Workshop', 'Hackathon', 'Placement Drive', 'Seminar', 'Cultural'],
        message: '{VALUE} is not a supported category'
      },
      default: 'Workshop'
    },
    date: {
      type: Date,
      required: [true, 'Event date is required']
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
      trim: true
    },
    venue: {
      type: String,
      required: [true, 'Event venue is required'],
      trim: true
    },
    maxSeats: {
      type: Number,
      required: [true, 'Maximum seat capacity is required'],
      min: [1, 'Seat capacity must be at least 1'],
      default: 50
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: [0, 'Registered count cannot be negative']
    },
    organizer: {
      type: String,
      trim: true,
      default: 'CampusConnect Committee'
    },
    speaker: {
      type: String,
      trim: true,
      default: 'Keynote Speaker'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.seatsAvailable = Math.max(0, ret.maxSeats - ret.registeredCount);
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

// Virtual for remaining seats
eventSchema.virtual('seatsAvailable').get(function () {
  return Math.max(0, this.maxSeats - this.registeredCount);
});

// Indexes for high performance querying & optimization bonus
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ title: 'text', description: 'text' });

export const Event = mongoose.model('Event', eventSchema);
