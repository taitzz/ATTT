const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getPosts);
router.get('/my-posts', postController.getMyPosts);
router.post('/', postController.createPost);
router.put('/:id', postController.updatePost);
router.delete('/:id', postController.deletePost);

module.exports = router;