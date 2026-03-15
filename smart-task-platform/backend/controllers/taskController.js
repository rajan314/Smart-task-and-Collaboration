const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper: check if user has access to a project
const hasProjectAccess = async (projectId, userId, userRole) => {
  if (userRole === 'admin') return true;
  const project = await Project.findById(projectId);
  if (!project) return false;
  const isOwner = project.owner.toString() === userId;
  const isMember = project.members.some((m) => m.user.toString() === userId);
  return isOwner || isMember;
};

// @desc    Get all tasks for current user (or all for admin)
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query = {};
    const { status, priority, project, assignedTo } = req.query;

    if (req.user.role !== 'admin') {
      // Get projects user belongs to
      const projects = await Project.find({
        $or: [{ owner: req.user.id }, { 'members.user': req.user.id }],
      }).select('_id');
      query.project = { $in: projects.map((p) => p._id) };
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (project) query.project = project;
    if (assignedTo) query.assignedTo = assignedTo;

    const tasks = await Task.find(query)
      .populate('project', 'name status')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get tasks for a specific project
// @route   GET /api/projects/:id/tasks
// @access  Private
exports.getProjectTasks = async (req, res) => {
  try {
    const canAccess = await hasProjectAccess(req.params.id, req.user.id, req.user.role);
    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const tasks = await Task.find({ project: req.params.id })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name')
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('comments.author', 'name email avatar');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const canAccess = await hasProjectAccess(task.project._id, req.user.id, req.user.role);
    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const canAccess = await hasProjectAccess(req.body.project, req.user.id, req.user.role);
    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    req.body.createdBy = req.user.id;
    const task = await Task.create(req.body);
    await task.populate('assignedTo', 'name email avatar');
    await task.populate('createdBy', 'name email avatar');

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const canAccess = await hasProjectAccess(task.project, req.user.id, req.user.role);
    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    delete req.body.createdBy;
    delete req.body.project;

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email avatar')
      .populate('createdBy', 'name email avatar')
      .populate('project', 'name');

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Manager+ or task creator
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const canAccess = await hasProjectAccess(task.project, req.user.id, req.user.role);
    if (!canAccess) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const isCreator = task.createdBy.toString() === req.user.id;
    if (!['admin', 'manager'].includes(req.user.role) && !isCreator) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();
    res.status(200).json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to task
// @route   POST /api/tasks/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.comments.push({ text: req.body.text, author: req.user.id });
    await task.save();
    await task.populate('comments.author', 'name email avatar');

    res.status(200).json({ success: true, data: task.comments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
