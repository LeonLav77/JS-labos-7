import { Request, Response } from 'express';
import PostRepository from '../repositories/PostRepository';
import { Post } from '../models/Post';

class PostController {
    private postRepository: PostRepository;

    constructor() {
        this.postRepository = new PostRepository();
    }

    public async getAllPosts(req: Request, res: Response): Promise<void> {
        try {
            const posts: Post[] = await this.postRepository.getAllPosts();
            res.status(200).send(posts);
        } catch (error) {
            res.status(500).send('Error fetching posts');
        }
    }

    public async getPostsByUserId(req: Request, res: Response): Promise<void> {
        const userId = req.params.userId;

        try {
            const posts = await this.postRepository.getPostsByUserId(Number(userId));
            if (!posts || posts.length === 0) {
                res.status(404).send('No posts found for this user');
                return;
            }
            res.send(posts);
        } catch (error) {
            res.status(500).send('Server error');
        }
    }


    public async getPostById(req: Request, res: Response): Promise<void> {
        const postId: string = req.params.id;
        const post: Post | null = await this.postRepository.getPostById(postId);

        if (!post) {
            res.status(404).send('Post not found');
            return;
        }
        res.send(post);
    }

    public async createPost(req: Request, res: Response): Promise<void> {
        const { userId, comment } = req.body;

        if (!userId || !comment) {
            res.status(400).send('Missing required fields');
            return;
        }

        const timestamp = new Date().toISOString();

        const newPost: Post = await this.postRepository.createPost(userId, timestamp, comment);
        
        res.status(201).send({ ...newPost });
    }

    public async updatePost(req: Request, res: Response): Promise<void> {
        const postId: string = req.params.id;
        const { comment } = req.body;

        if (!comment) {
            res.status(400).send('Missing required fields');
            return;
        }

        const updatedPost: Post = await this.postRepository.updatePost(postId, comment);

        if (!updatedPost) {
            res.status(404).send('Post not found');
            return;
        }

        res.send(updatedPost);
    }

    public async deletePost(req: Request, res: Response): Promise<void> {
        const postId: string = req.params.id;

        let postExists = await this.postRepository.getPostById(postId);
        if (!postExists) {
            res.status(404).send('Post not found');
            return;
        }

        const deletedPost: Post = await this.postRepository.deletePost(postId);

        res.send(deletedPost);
    }
}

export default PostController;
