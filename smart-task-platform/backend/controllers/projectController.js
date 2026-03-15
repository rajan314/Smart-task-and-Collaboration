const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all projects (accessible to user)
// @route   GET /api/projects
// @access  Private
exports.getProjects = async (req, res) => {
  try {
    let query;
    if (req.user.role === 'admin') {
      query = Project.find();
    } else {
      query = Project.find({
        $or: [
          { owner: req.user.id },
          { 'members.user': req.user.id },
        ],
      });
    }

    const projects = await query
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email avatar role')
      .populate('members.user', 'name email avatar role');

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check access
    if (req.user.role !== 'admin') {
      const isMember = project.members.some((m) => m.user._id.toString() === req.user.id);
      const isOwner = project.owner._id.toString() === req.user.id;
      if (!isMember && !isOwner) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
    }

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create project
// @route   POST /api/projects
// @access  Manager+
exports.createProject = async (req, res) => {
  try {
    req.body.owner = req.user.id;
    const project = await Project.create(req.body);
    await project.populate('owner', 'name email avatar');
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Owner or Admin
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Prevent changing owner
    delete req.body.owner;
    delete req.body.members;

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name email avatar').populate('members.user', 'name email avatar');

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Delete all tasks in project
    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.status(200).json({ success: true, message: 'Project and all tasks deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add member to project
// @route   POST /api/projects/:id/members
// @access  Owner or Admin
exports.addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const alreadyMember = project.members.some((m) => m.user.toString() === userId);
    if (alreadyMember || project.owner.toString() === userId) {
      return res.status(400).json({ success: false, message: 'User is already a member' });
    }

    project.members.push({ user: userId, role: role || 'member' });
    await project.save();
    await project.populate('members.user', 'name email avatar');

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove member from project
// @route   DELETE /api/projects/:id/members/:userId
// @access  Owner or Admin
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    if (req.user.role !== 'admin' && project.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    project.members = project.members.filter((m) => m.user.toString() !== req.params.userId);
    await project.save();

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
