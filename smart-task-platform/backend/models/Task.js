const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'review', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dueDate: { type: Date },
    completedAt: { type: Date },
    tags: [{ type: String, trim: true }],
    comments: [
      {
        text: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Auto-set completedAt when status becomes 'done'
TaskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'done' && !this.completedAt) {
    this.completedAt = Date.now();
  }
  if (this.isModified('status') && this.status !== 'done') {
    this.completedAt = undefined;
  }
  next();
});

module.exports = mongoose.model('Task', TaskSchema);
