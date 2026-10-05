import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      index: true
    },
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: 1,
      max: 8,
      index: true
    },
    category: {
      type: String,
      enum: ['Notes', 'Previous Year Paper', 'Lab Manual', 'Reference Book', 'Syllabus'],
      default: 'Notes'
    },
    fileUrl: {
      type: String,
      required: [true, 'File path or URL is required']
    },
    fileName: {
      type: String,
      required: [true, 'File name is required']
    },
    fileSize: {
      type: Number,
      default: 0
    },
    fileType: {
      type: String,
      default: 'application/pdf'
    },
    downloads: {
      type: Number,
      default: 0
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      }
    }
  }
);

resourceSchema.index({ subject: 1, semester: 1 });
resourceSchema.index({ category: 1 });
resourceSchema.index({ title: 'text', description: 'text' });

export const Resource = mongoose.model('Resource', resourceSchema);
