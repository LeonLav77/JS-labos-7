import { Router, Request, Response } from 'express';
import PostController from '../controllers/PostController';

const router: Router = Router();
const postController = new PostController();

// Get all posts
router.get('/', (req: Request, res: Response) => {
    postController.getAllPosts(req, res);
});

// Get a single post by ID
router.get('/:id', (req: Request, res: Response) => {
    postController.getPostById(req, res);
});

router.get('/user/:userId', (req: Request, res: Response) => {
    postController.getPostsByUserId(req, res);
});

// Create a new post
router.post('/', (req: Request, res: Response) => {
    postController.createPost(req, res);
});

// Update a post
router.put('/:id', (req: Request, res: Response) => {
    postController.updatePost(req, res);
});

// Delete a post
router.delete('/:id', (req: Request, res: Response) => {
    postController.deletePost(req, res);
});

export default router;