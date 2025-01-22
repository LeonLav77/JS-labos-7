import { Router, Request, Response } from 'express';
import PostController from '../controllers/PostController';

const router: Router = Router();
const postController = new PostController();

router.get('/', (req: Request, res: Response) => {
    postController.getAllPosts(req, res);
});

router.get('/:id', (req: Request, res: Response) => {
    postController.getPostById(req, res);
});

router.get('/user/:userId', (req: Request, res: Response) => {
    postController.getPostsByUserId(req, res);
});

router.post('/', (req: Request, res: Response) => {
    postController.createPost(req, res);
});

export default router;