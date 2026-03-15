const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Admin
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/:id
// @access  Private (own profile) or Admin
exports.updateUser = async (req, res) => {
  try {
    // Non-admins can only update their own profile
    if (req.user.role !== 'admin' && req.user.id !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this user' });
    }

    const { name, avatar } = req.body;
    const updateFields = {};
    if (name) updateFields.name = name;
    if (avatar !== undefined) updateFields.avatar = avatar;

    // Only admin can change roles
    if (req.body.role && req.user.role === 'admin') {
      updateFields.role = req.body.role;
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    // Soft delete
    user.isActive = false;
    await user.save();
    res.status(200).json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
