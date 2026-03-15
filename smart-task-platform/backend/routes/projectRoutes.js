const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');
const { getProjectTasks } = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('admin', 'manager'), createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('admin', 'manager'), updateProject)
  .delete(authorize('admin'), deleteProject);

router.post('/:id/members', authorize('admin', 'manager'), addMember);
router.delete('/:id/members/:userId', authorize('admin', 'manager'), removeMember);
router.get('/:id/tasks', getProjectTasks);

module.exports = router;
