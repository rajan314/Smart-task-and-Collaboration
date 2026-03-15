const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'on-hold', 'completed', 'cancelled'],
      default: 'planning',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['manager', 'member'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    startDate: { type: Date },
    dueDate: { type: Date },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: task count
ProjectSchema.virtual('taskCount', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
  count: true,
});

module.exports = mongoose.model('Project', ProjectSchema);
