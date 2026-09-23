const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/task.controller');

router.use(authenticateToken); // all task routes require a valid token

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;