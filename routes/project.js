const express = require('express');
let router = express.Router();
const checkAuth = require('../middleware/check-auth');
const projectController = require('../controllers/project');
const multer = require('../middleware/multer-config');

router.get('/', projectController.getAllProjects);
router.get('/images', projectController.getAllProjectImages);
router.get('/:id/like', projectController.getTotalLike);
router.get('/:id', projectController.getProject);
router.post('/', checkAuth, multer, projectController.addProject);
router.put('/:id', checkAuth, multer, projectController.updateProject);
router.put('/:id/like', projectController.addLike);
router.delete('/:id', checkAuth, projectController.deleteProject);
module.exports = router;
