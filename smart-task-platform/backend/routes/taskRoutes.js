const express = require('express');
const { getTasks, getTask, createTask, updateTask, deleteTask, addComment } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.post('/:id/comments', addComment);

module.exports = router;
